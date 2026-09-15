import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { Repository } from "typeorm"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import type { Env } from "@core/config/env.validation"
import { MailerService } from "@core/mailer/mailer.service"
import { RedisService } from "@core/redis/redis.service"
import type { MerchantForgotPasswordDto } from "@merchant/dto/auth/forgot-password.dto"
import type { MerchantLoginDto } from "@merchant/dto/auth/login.dto"
import type { MerchantResetPasswordDto } from "@merchant/dto/auth/reset-password.dto"
import type { MerchantTwoFactorDto } from "@merchant/dto/auth/two-factor.dto"
import { MerchantPasswordReset } from "@merchant/entities/merchant-password-reset.entity"
import { Merchant } from "@merchant/entities/merchant.entity"
import { MerchantTwoFactor } from "@merchant/entities/merchant-two-factor.entity"

export type MerchantAuthResult =
	| { requires2fa: true; merchantId: number; email: string | null }
	| {
			requires2fa: false
			accessToken: string
			refreshToken: string
			user: {
				id: number
				uniqueNumber: string
				email: string | null
				name: string | null
				merchantName: string | null
			}
	  }

@Injectable()
export class MerchantAuthService {
	constructor(
		@InjectRepository(Merchant)
		private readonly merchantRepository: Repository<Merchant>,
		@InjectRepository(MerchantTwoFactor)
		private readonly twoFactorRepository: Repository<MerchantTwoFactor>,
		@InjectRepository(MerchantPasswordReset)
		private readonly passwordResetRepository: Repository<MerchantPasswordReset>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<Env, true>,
		private readonly redisService: RedisService,
		private readonly mailerService: MailerService,
	) {}

	private async generateTokens(merchant: Merchant) {
		const tokenId = crypto.randomUUID()
		const payload: JwtPayload = {
			sub: merchant.id,
			email: merchant.email ?? "",
			role: "merchant",
			domain: "merchant",
			tokenId,
		}

		const accessToken = await this.jwtService.signAsync(payload, {
			secret: this.configService.get("JWT_ACCESS_SECRET", { infer: true }),
			expiresIn: this.configService.get("JWT_ACCESS_EXPIRES", { infer: true }) as any,
		})

		const refreshToken = await this.jwtService.signAsync(payload, {
			secret: this.configService.get("JWT_REFRESH_SECRET", { infer: true }),
			expiresIn: this.configService.get("JWT_REFRESH_EXPIRES", { infer: true }) as any,
		})

		// TTL for refresh token: 7 days (604800s)
		await this.redisService.storeRefreshToken("merchant", merchant.id, tokenId, 7 * 24 * 60 * 60)

		return { accessToken, refreshToken }
	}

	async login(dto: MerchantLoginDto, clientIp: string): Promise<MerchantAuthResult> {
		const merchant = await this.merchantRepository.findOneBy({ uniqueNumber: dto.uniqueNumber })
		if (!merchant || !merchant.password) {
			throw new UnauthorizedException("Nomor Merchant atau password yang Anda masukkan salah.")
		}

		const dbHash = merchant.password.trim().replace(/^\$2y\$/, "$2b$")
		const isPasswordValid = await bcrypt.compare(dto.password, dbHash)
		if (!isPasswordValid) {
			throw new UnauthorizedException("Nomor Merchant atau password yang Anda masukkan salah.")
		}

		if (merchant.isBlocked) {
			throw new ForbiddenException("Akun Merchant Anda saat ini sedang dinonaktifkan atau diblokir.")
		}

		// 2FA Check if enabled
		if (merchant.enabled2fa && merchant.email) {
			const trustedRecord = await this.twoFactorRepository.findOneBy({
				merchantId: String(merchant.id),
				twoFactorIp: clientIp,
			})

			if (!trustedRecord || !trustedRecord.twoFactorIp) {
				const code = Math.floor(100000 + Math.random() * 900000).toString()
				const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

				const record = this.twoFactorRepository.create({
					merchantId: String(merchant.id),
					twoFactorIp: clientIp,
					twoFactorCode: code,
					twoFactorExpiresAt: expiresAt,
				})
				await this.twoFactorRepository.save(record)

				await this.mailerService.sendTwoFactorCode(merchant.email, {
					name: merchant.merchantName ?? merchant.name ?? "Merchant",
					code,
				})

				return { requires2fa: true, merchantId: merchant.id, email: merchant.email }
			}
		}

		const tokens = await this.generateTokens(merchant)

		return {
			requires2fa: false,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: merchant.id,
				uniqueNumber: merchant.uniqueNumber,
				email: merchant.email,
				name: merchant.name,
				merchantName: merchant.merchantName,
			},
		}
	}

	async verifyTwoFactor(
		dto: MerchantTwoFactorDto,
		clientIp: string,
		merchantId: number,
	): Promise<MerchantAuthResult> {
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant) {
			throw new UnauthorizedException("Merchant tidak ditemukan.")
		}

		const record = await this.twoFactorRepository.findOne({
			where: {
				merchantId: String(merchantId),
				twoFactorCode: dto.code,
			},
			order: { createdAt: "DESC" },
		})

		if (!record || !record.twoFactorExpiresAt || record.twoFactorExpiresAt < new Date()) {
			throw new BadRequestException("Kode 2FA salah atau telah kadaluarsa.")
		}

		// Update IP trust record
		record.twoFactorCode = null
		record.twoFactorIp = clientIp
		await this.twoFactorRepository.save(record)

		const tokens = await this.generateTokens(merchant)

		return {
			requires2fa: false,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: merchant.id,
				uniqueNumber: merchant.uniqueNumber,
				email: merchant.email,
				name: merchant.name,
				merchantName: merchant.merchantName,
			},
		}
	}

	async resendTwoFactor(merchantId: number, clientIp: string): Promise<{ message: string }> {
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant || !merchant.email) {
			throw new BadRequestException("Data merchant atau email tidak ditemukan.")
		}

		const code = Math.floor(100000 + Math.random() * 900000).toString()
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

		const record = this.twoFactorRepository.create({
			merchantId: String(merchant.id),
			twoFactorIp: clientIp,
			twoFactorCode: code,
			twoFactorExpiresAt: expiresAt,
		})
		await this.twoFactorRepository.save(record)

		await this.mailerService.sendTwoFactorCode(merchant.email, {
			name: merchant.merchantName ?? merchant.name ?? "Merchant",
			code,
		})

		return { message: "Kode verifikasi 2FA baru telah dikirim ke email Anda." }
	}

	async forgotPassword(dto: MerchantForgotPasswordDto): Promise<{ message: string }> {
		const merchant = await this.merchantRepository.findOneBy({ uniqueNumber: dto.uniqueNumber })
		if (!merchant || !merchant.email) {
			return { message: "Jika Nomor Merchant terdaftar, instruksi reset password telah dikirim ke email Anda." }
		}

		const token = crypto.randomBytes(32).toString("hex")

		// Remove existing reset records for this email
		await this.passwordResetRepository.delete({ email: merchant.email })

		const resetRecord = this.passwordResetRepository.create({
			email: merchant.email,
			token,
			createdAt: new Date(),
		})
		await this.passwordResetRepository.save(resetRecord)

		const baseUrl = this.configService.get("APP_URL", { infer: true }) || "http://localhost:4200"
		const resetUrl = `${baseUrl}/merchant/reset-password?token=${token}&email=${encodeURIComponent(merchant.email)}`

		await this.mailerService.sendForgotPassword(merchant.email, {
			name: merchant.merchantName ?? merchant.name ?? "Merchant",
			resetUrl,
		})

		return { message: "Jika Nomor Merchant terdaftar, instruksi reset password telah dikirim ke email Anda." }
	}

	async refreshToken(user: JwtPayload) {
		const merchant = await this.merchantRepository.findOneBy({ id: user.sub })
		if (!merchant || merchant.isBlocked) {
			throw new UnauthorizedException("Sesi tidak valid.")
		}

		return this.generateTokens(merchant)
	}

	async resetPassword(dto: MerchantResetPasswordDto): Promise<{ message: string }> {
		const resetRecord = await this.passwordResetRepository.findOneBy({
			email: dto.email,
			token: dto.token,
		})

		if (!resetRecord) {
			throw new BadRequestException("Token reset password tidak valid atau telah digunakan.")
		}

		if (
			resetRecord.createdAt &&
			Date.now() - new Date(resetRecord.createdAt).getTime() > 24 * 60 * 60 * 1000
		) {
			await this.passwordResetRepository.delete({ email: dto.email, token: dto.token })
			throw new BadRequestException("Token reset password telah kadaluarsa.")
		}

		const merchant = await this.merchantRepository.findOneBy({ email: dto.email })
		if (!merchant) {
			throw new BadRequestException("Akun merchant tidak ditemukan.")
		}

		const passwordHash = await bcrypt.hash(dto.password, 10)
		merchant.password = passwordHash
		await this.merchantRepository.save(merchant)

		await this.passwordResetRepository.delete({ email: dto.email })

		return { message: "Password berhasil diperbarui. Silakan login kembali." }
	}

	async sendEmailVerification(merchantId: number): Promise<{ message: string }> {
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		if (!merchant || !merchant.email) {
			throw new BadRequestException("Email merchant tidak ditemukan.")
		}

		const token = crypto.randomBytes(32).toString("hex")
		const key = `merchant-email-verify:${merchant.id}`

		await this.redisService.set(key, token, 3600)

		const baseUrl = this.configService.get("APP_URL", { infer: true }) || "http://localhost:4200"
		const verifyUrl = `${baseUrl}/merchant/auth/email/verify/${merchant.id}/${token}`

		await this.mailerService.sendEmailVerification(merchant.email, {
			name: merchant.merchantName ?? merchant.name ?? "Merchant",
			verifyUrl,
		})

		return { message: "Email verifikasi telah dikirim ke " + merchant.email }
	}

	async verifyEmail(id: number, hash: string): Promise<{ message: string }> {
		const key = `merchant-email-verify:${id}`
		const token = await this.redisService.get(key)

		if (!token || token !== hash) {
			throw new BadRequestException("Token verifikasi email tidak valid atau telah kadaluarsa.")
		}

		const merchant = await this.merchantRepository.findOneBy({ id })
		if (!merchant) {
			throw new BadRequestException("Merchant tidak ditemukan.")
		}

		merchant.emailVerifiedAt = new Date()
		await this.merchantRepository.save(merchant)
		await this.redisService.del(key)

		return { message: "Email berhasil diverifikasi." }
	}

	async logout(merchantId: number, tokenId?: string): Promise<{ message: string }> {
		if (tokenId) {
			await this.redisService.revokeRefreshToken("merchant", merchantId, tokenId)
		}
		return { message: "Berhasil keluar." }
	}
}
