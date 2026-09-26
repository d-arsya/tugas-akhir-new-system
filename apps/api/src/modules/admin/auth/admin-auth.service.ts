import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { Repository } from "typeorm"
import { RedisService } from "@core/redis/redis.service"
import { MailerService } from "@core/mailer/mailer.service"
import { AuthLogWriter } from "@admin/auth/auth-log.writer"
import { User } from "@admin/auth/entities/user.entity"
import type { Env } from "@core/config/env.validation"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import type {
	AdminLoginDto,
	AdminForgotPasswordDto,
	AdminResetPasswordDto,
	AdminTwoFactorDto,
} from "@admin/auth/dto/admin-auth.dto"

export type AdminAuthResult = {
	requires2fa?: boolean
	adminId?: number
	email?: string
	accessToken?: string
	refreshToken?: string
	user?: {
		id: number
		name: string | null
		email: string | null
		role: string | null
		gender: string | null
	}
}

@Injectable()
export class AdminAuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<Env, true>,
		private readonly redisService: RedisService,
		private readonly mailerService: MailerService,
		private readonly authLogWriter: AuthLogWriter,
	) {}

	async login(dto: AdminLoginDto, clientIp: string, userAgent?: string): Promise<AdminAuthResult> {
		const user = await this.userRepository.findOneBy({ email: dto.email })
		if (!user || !user.password) {
			// Legacy `LogFailedLogin` stores "-" when the email does not belong to a user
			await this.authLogWriter.open({
				userId: null,
				email: "-",
				ipAddress: clientIp,
				userAgent,
				status: "Failed",
			})
			throw new UnauthorizedException("Email atau password yang Anda masukkan salah.")
		}

		const dbHash = user.password.trim().replace(/^\$2y\$/, "$2b$")
		const isPasswordValid = await bcrypt.compare(dto.password, dbHash)
		if (!isPasswordValid) {
			await this.authLogWriter.open({
				userId: user.id,
				email: user.email,
				ipAddress: clientIp,
				userAgent,
				status: "Failed",
			})
			throw new UnauthorizedException("Email atau password yang Anda masukkan salah.")
		}

		if (user.isBlocked) {
			await this.authLogWriter.open({
				userId: user.id,
				email: user.email,
				ipAddress: clientIp,
				userAgent,
				status: "Failed",
			})
			throw new ForbiddenException("Akun admin Anda saat ini sedang nonaktif atau diblokir.")
		}

		return this.issueSession(user, clientIp, userAgent, dto.rememberMe)
	}

	/**
	 * Creates the tokens and the "Logged In" row for every entry point that starts a session
	 * (login, 2FA verify, create-password), with the token id kept as the session id.
	 */
	async issueSession(
		user: User,
		clientIp: string,
		userAgent?: string,
		rememberMe?: boolean,
	): Promise<AdminAuthResult> {
		const tokens = await this.generateTokens(user)
		await this.authLogWriter.open({
			userId: user.id,
			email: user.email,
			ipAddress: clientIp,
			userAgent,
			sessionId: tokens.tokenId,
			rememberMe,
			status: "Logged In",
		})

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				gender: user.gender,
			},
		}
	}

	async verifyTwoFactor(dto: AdminTwoFactorDto, clientIp: string, userAgent?: string): Promise<AdminAuthResult> {
		const storedCode = await this.redisService.get(`2fa:admin:${dto.adminId}`)
		if (!storedCode || storedCode !== dto.code) {
			throw new BadRequestException("Kode 2FA salah atau telah kadaluarsa.")
		}

		await this.redisService.del(`2fa:admin:${dto.adminId}`)

		const user = await this.userRepository.findOneBy({ id: dto.adminId })
		if (!user || user.isBlocked) {
			throw new UnauthorizedException("Akun tidak ditemukan atau diblokir.")
		}

		return this.issueSession(user, clientIp, userAgent)
	}

	async resendTwoFactor(adminId: number): Promise<{ message: string }> {
		const user = await this.userRepository.findOneBy({ id: adminId })
		if (!user || !user.email) {
			throw new BadRequestException("User admin tidak ditemukan.")
		}

		const code = Math.floor(100000 + Math.random() * 900000).toString()
		await this.redisService.set(`2fa:admin:${user.id}`, code, 600) // 10 minutes

		try {
			await this.mailerService.sendTwoFactorCode(user.email, {
				name: user.name || "Admin",
				code,
			})
		} catch (err) {
			console.error("[2FA Resend Error]", err)
		}

		return { message: "Kode verifikasi 2FA baru telah dikirim ke email Anda." }
	}

	async forgotPassword(dto: AdminForgotPasswordDto): Promise<{ message: string }> {
		const user = await this.userRepository.findOneBy({ email: dto.email })
		if (!user || !user.email) {
			return { message: "Jika email terdaftar, instruksi reset password telah dikirim ke email Anda." }
		}

		const token = crypto.randomBytes(32).toString("hex")
		await this.redisService.set(`reset:admin:${token}`, user.email, 3600) // 1 hour TTL

		const frontendUrl = this.configService.get("ADMIN_URL", { infer: true }) || "http://localhost:4200"
		const resetUrl = `${frontendUrl}/reset-password?token=${token}`

		try {
			await this.mailerService.sendForgotPassword(user.email, {
				name: user.name || "Admin",
				resetUrl,
			})
		} catch (err) {
			console.error("[ForgotPassword Email Error]", err)
		}

		return { message: "Instruksi reset password telah dikirim ke email Anda." }
	}

	async resetPassword(dto: AdminResetPasswordDto): Promise<{ message: string }> {
		const email = await this.redisService.get(`reset:admin:${dto.token}`)
		if (!email) {
			throw new BadRequestException("Token reset password tidak valid atau telah kadaluarsa.")
		}

		const user = await this.userRepository.findOneBy({ email })
		if (!user) {
			throw new BadRequestException("User admin tidak ditemukan.")
		}

		user.password = await bcrypt.hash(dto.password, 10)
		user.weakPassword = dto.password.length < 8
		await this.userRepository.save(user)
		await this.redisService.del(`reset:admin:${dto.token}`)

		return { message: "Password berhasil diperbarui. Silakan login dengan password baru Anda." }
	}

	async refreshToken(payload: JwtPayload): Promise<AdminAuthResult> {
		const user = await this.userRepository.findOneBy({ id: payload.sub })
		if (!user || user.isBlocked) {
			throw new UnauthorizedException("Akun tidak ditemukan atau telah diblokir.")
		}

		// Revoke existing refresh token from Redis
		if (payload.tokenId) {
			await this.redisService.revokeRefreshToken("admin", user.id, payload.tokenId)
		}

		const tokens = await this.generateTokens(user)
		// The open auth-log row is keyed by the token id, so it follows the rotation
		await this.authLogWriter.rotateSession(payload.tokenId, tokens.tokenId)

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				gender: user.gender,
			},
		}
	}

	async logout(userId: number, tokenId?: string, _clientIp?: string, _userAgent?: string): Promise<{ success: boolean; message: string }> {
		if (tokenId) {
			await this.redisService.revokeRefreshToken("admin", userId, tokenId)
		}
		// Legacy closes the row of the current session instead of adding a new one
		await this.authLogWriter.close(tokenId, userId)
		return { success: true, message: "Berhasil keluar dari sistem admin." }
	}

	private async generateTokens(
		user: User,
	): Promise<{ accessToken: string; refreshToken: string; tokenId: string }> {
		const tokenId = crypto.randomUUID()
		const payload: JwtPayload = {
			sub: user.id,
			email: user.email ?? "",
			role: user.role ?? "Admin",
			domain: "admin",
			tokenId,
		}

		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get("JWT_ACCESS_SECRET", { infer: true }),
			expiresIn: "15m",
		})

		const refreshToken = this.jwtService.sign(payload, {
			secret: this.configService.get("JWT_REFRESH_SECRET", { infer: true }),
			expiresIn: "7d",
		})

		// Store refresh token in Redis (7 days = 604800 seconds)
		await this.redisService.storeRefreshToken("admin", user.id, tokenId, 604800)

		return { accessToken, refreshToken, tokenId }
	}
}
