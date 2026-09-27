import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { IsNull, Repository } from "typeorm"
import { MailerService } from "@core/mailer/mailer.service"
import { RedisService } from "@core/redis/redis.service"
import { RegistrantPasswordReset } from "@psb/entities/registrant-password-reset.entity"
import { Registrant } from "@psb/entities/registrant.entity"
import { TwoFactorRegistrant } from "@psb/entities/two-factor-registrant.entity"
import type { Env } from "@core/config/env.validation"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import type { PsbForgotPasswordDto } from "@psb/dto/auth/forgot-password.dto"
import type { PsbLoginDto } from "@psb/dto/auth/login.dto"
import type { PsbResetPasswordDto } from "@psb/dto/auth/reset-password.dto"
import type { PsbTwoFactorDto } from "@psb/dto/auth/two-factor.dto"

export type AuthResult =
	| { requires2fa: true; email: string }
	| {
		requires2fa: false
		accessToken: string
		refreshToken: string
		user: {
			id: number
			email: string
			fullname: string | null
			registrantId: string | null
			approvalStatus: string | null
		}
	}

@Injectable()
export class PsbAuthService {
	constructor(
		@InjectRepository(Registrant)
		private readonly registrantRepository: Repository<Registrant>,
		@InjectRepository(TwoFactorRegistrant)
		private readonly twoFactorRepository: Repository<TwoFactorRegistrant>,
		@InjectRepository(RegistrantPasswordReset)
		private readonly passwordResetRepository: Repository<RegistrantPasswordReset>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<Env, true>,
		private readonly redisService: RedisService,
		private readonly mailerService: MailerService,
	) { }

	async login(dto: PsbLoginDto, clientIp: string): Promise<AuthResult> {
		const registrant = await this.registrantRepository.findOneBy({ email: dto.email })
		if (!registrant || !registrant.password) {
			throw new UnauthorizedException("Email atau password yang Anda masukkan salah.")
		}

		const dbHash = registrant.password.trim().replace(/^\$2y\$/, "$2b$")
		const isPasswordValid = await bcrypt.compare(dto.password, dbHash)
		if (!isPasswordValid) {
			throw new UnauthorizedException("Email atau password yang Anda masukkan salah.")
		}

		return this.completeLogin(registrant, clientIp)
	}

	async completeLogin(registrant: Registrant, clientIp: string): Promise<AuthResult> {
		if (registrant.isBlocked) {
			throw new ForbiddenException("Akun pendaftaran Anda saat ini sedang dinonaktifkan atau diblokir.")
		}

		// Email verification check (matching legacy behavior)
		if (!registrant.emailVerifiedAt) {
			throw new ForbiddenException("Email Anda belum diverifikasi. Silakan cek email Anda untuk melakukan verifikasi terlebih dahulu.")
		}

		// 2FA check (only executed after email is verified)
		if (registrant.enabled2fa) {
			const trustedIp = await this.twoFactorRepository.findOneBy({
				registrantId: registrant.registrantId ?? String(registrant.id),
				twoFactorIp: clientIp,
				twoFactorCode: IsNull(),
			})

			if (!trustedIp) {
				const code = Math.floor(100000 + Math.random() * 900000).toString()
				const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

				const twoFactorRecord = this.twoFactorRepository.create({
					registrantId: registrant.registrantId ?? String(registrant.id),
					twoFactorIp: clientIp,
					twoFactorCode: code,
					twoFactorExpiresAt: expiresAt,
				})
				await this.twoFactorRepository.save(twoFactorRecord)

				await this.mailerService.sendTwoFactorCode(registrant.email!, {
					name: registrant.fullname ?? "Calon Santri",
					code,
				})

				return { requires2fa: true, email: registrant.email! }
			}
		}

		return this.generateTokens(registrant)
	}

	async verifyTwoFactor(dto: PsbTwoFactorDto, clientIp: string): Promise<AuthResult> {
		const registrant = await this.registrantRepository.findOneBy({ email: dto.email })
		if (!registrant) {
			throw new UnauthorizedException("Akun pendaftaran tidak ditemukan.")
		}

		const twoFactorRecord = await this.twoFactorRepository.findOne({
			where: {
				registrantId: registrant.registrantId ?? String(registrant.id),
				twoFactorCode: dto.code,
			},
			order: { createdAt: "DESC" },
		})

		if (!twoFactorRecord || !twoFactorRecord.twoFactorExpiresAt || twoFactorRecord.twoFactorExpiresAt < new Date()) {
			throw new BadRequestException("Kode verifikasi 2FA tidak valid atau telah kadaluarsa.")
		}

		// Mark IP as trusted
		twoFactorRecord.twoFactorIp = clientIp
		twoFactorRecord.twoFactorCode = null
		await this.twoFactorRepository.save(twoFactorRecord)

		return this.generateTokens(registrant)
	}

	async resendTwoFactor(email: string, clientIp: string): Promise<{ message: string }> {
		const registrant = await this.registrantRepository.findOneBy({ email })
		if (!registrant) {
			throw new BadRequestException("Email tidak ditemukan.")
		}

		const code = Math.floor(100000 + Math.random() * 900000).toString()
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

		const twoFactorRecord = this.twoFactorRepository.create({
			registrantId: registrant.registrantId ?? String(registrant.id),
			twoFactorIp: clientIp,
			twoFactorCode: code,
			twoFactorExpiresAt: expiresAt,
		})
		await this.twoFactorRepository.save(twoFactorRecord)

		await this.mailerService.sendTwoFactorCode(registrant.email!, {
			name: registrant.fullname ?? "Calon Santri",
			code,
		})

		return { message: "Kode verifikasi baru telah dikirimkan ke email Anda." }
	}

	async sendVerificationEmail(email: string, name?: string, clientUrl?: string): Promise<{ message: string }> {
		const registrant = await this.registrantRepository.findOneBy({ email })
		if (!registrant) {
			throw new BadRequestException("Email tidak ditemukan.")
		}
		if (registrant.emailVerifiedAt) {
			return { message: "Email Anda sudah terverifikasi sebelumnya." }
		}

		const token = crypto.randomBytes(32).toString("hex")
		await this.redisService.set(`email-verify:${token}`, email, 24 * 60 * 60)

		const baseUrl = (clientUrl || this.configService.get("APP_URL", { infer: true }) || "http://localhost:4200").replace(/\/+$/, "")
		const verifyUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

		await this.mailerService.sendEmailVerification(email, {
			name: name ?? registrant.fullname ?? "Calon Santri",
			verifyUrl,
		})

		return { message: "Email verifikasi telah dikirimkan. Silakan cek kotak masuk email Anda." }
	}

	async verifyEmail(token: string): Promise<{ message: string }> {
		const targetEmail = await this.redisService.get(`email-verify:${token}`)

		if (!targetEmail) {
			throw new BadRequestException("Token verifikasi email tidak valid atau telah kadaluarsa.")
		}

		const registrant = await this.registrantRepository.findOneBy({ email: targetEmail })
		if (!registrant) {
			throw new BadRequestException("Akun pendaftaran tidak ditemukan.")
		}

		if (registrant.emailVerifiedAt) {
			return { message: "Email Anda telah berhasil diverifikasi! Silakan login untuk melanjutkan." }
		}

		registrant.emailVerifiedAt = new Date()
		await this.registrantRepository.save(registrant)
		await this.redisService.del(`email-verify:${token}`)

		return { message: "Email Anda telah berhasil diverifikasi! Silakan login untuk melanjutkan." }
	}

	async forgotPassword(dto: PsbForgotPasswordDto): Promise<{ message: string }> {
		const registrant = await this.registrantRepository.findOneBy({ email: dto.email })
		if (registrant && registrant.email) {
			const token = crypto.randomBytes(32).toString("hex")
			const resetRecord = this.passwordResetRepository.create({
				email: registrant.email,
				token,
			})
			await this.passwordResetRepository.save(resetRecord)

			const baseUrl = (this.configService.get("PSB_URL", { infer: true }) || "http://localhost:4200").replace(/\/+$/, "")
			const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(registrant.email)}`

			await this.mailerService.sendForgotPassword(registrant.email, {
				name: registrant.fullname ?? "Calon Santri",
				resetUrl,
			})
		}

		return { message: "Jika email terdaftar, instruksi reset password telah dikirim ke email Anda." }
	}

	async resetPassword(dto: PsbResetPasswordDto): Promise<{ message: string }> {
		const resetRecord = await this.passwordResetRepository.findOneBy({
			email: dto.email,
			token: dto.token,
		})

		if (!resetRecord) {
			throw new BadRequestException("Token reset password tidak valid atau telah kadaluarsa.")
		}

		const registrant = await this.registrantRepository.findOneBy({ email: dto.email })
		if (!registrant) {
			throw new BadRequestException("Akun pendaftaran tidak ditemukan.")
		}

		registrant.password = await bcrypt.hash(dto.password, 10)
		await this.registrantRepository.save(registrant)
		await this.passwordResetRepository.delete({ email: dto.email })

		return { message: "Password Anda berhasil diperbarui. Silakan login dengan password baru." }
	}

	async generateTokens(registrant: Registrant): Promise<AuthResult> {
		const tokenId = crypto.randomUUID()
		const payload = {
			sub: registrant.id,
			email: registrant.email ?? "",
			role: "registrant",
			domain: "psb",
			tokenId,
		}

		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get("JWT_ACCESS_SECRET", { infer: true }),
			expiresIn: this.configService.get("JWT_ACCESS_EXPIRES", { infer: true }),
		})

		const refreshToken = this.jwtService.sign(payload, {
			secret: this.configService.get("JWT_REFRESH_SECRET", { infer: true }),
			expiresIn: this.configService.get("JWT_REFRESH_EXPIRES", { infer: true }),
		})

		// 7 days TTL
		await this.redisService.storeRefreshToken("psb", registrant.id, tokenId, 7 * 24 * 60 * 60)

		return {
			requires2fa: false,
			accessToken,
			refreshToken,
			user: {
				id: registrant.id,
				email: registrant.email ?? "",
				fullname: registrant.fullname,
				registrantId: registrant.registrantId,
				approvalStatus: registrant.approvalStatus,
			},
		}
	}

	async logout(userId: number, tokenId?: string): Promise<{ message: string }> {
		if (tokenId) {
			await this.redisService.revokeRefreshToken("psb", userId, tokenId)
		}
		return { message: "Berhasil logout." }
	}

	async refreshToken(user: JwtPayload): Promise<AuthResult> {
		const registrant = await this.registrantRepository.findOneBy({ id: user.sub })
		if (!registrant) {
			throw new UnauthorizedException("Akun pendaftaran tidak ditemukan.")
		}
		if (user.tokenId) {
			await this.redisService.revokeRefreshToken("psb", user.sub, user.tokenId)
		}
		return this.generateTokens(registrant)
	}
}
