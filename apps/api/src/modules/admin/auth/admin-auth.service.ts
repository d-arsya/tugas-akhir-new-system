import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { Repository } from "typeorm"
import { RedisService } from "@core/redis/redis.service"
import { MailerService } from "@core/mailer/mailer.service"
import { User } from "@admin/entities/user.entity"
import { AuthLog } from "@admin/entities/auth-log.entity"
import type { Env } from "@core/config/env.validation"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"
import type {
	AdminLoginDto,
	ChangePasswordDto,
	UpdateProfileDto,
	AdminForgotPasswordDto,
	AdminResetPasswordDto,
	AdminTwoFactorDto,
} from "@admin/dto/admin-auth.dto"

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
		@InjectRepository(AuthLog)
		private readonly authLogRepository: Repository<AuthLog>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<Env, true>,
		private readonly redisService: RedisService,
		private readonly mailerService: MailerService,
	) {}

	async login(dto: AdminLoginDto, clientIp: string, userAgent?: string): Promise<AdminAuthResult> {
		const user = await this.userRepository.findOneBy({ email: dto.email })
		if (!user || !user.password) {
			await this.recordAuthLog(null, dto.email, clientIp, userAgent, "Failed")
			throw new UnauthorizedException("Email atau password yang Anda masukkan salah.")
		}

		const dbHash = user.password.trim().replace(/^\$2y\$/, "$2b$")
		const isPasswordValid = await bcrypt.compare(dto.password, dbHash)
		if (!isPasswordValid) {
			await this.recordAuthLog(user.id, dto.email, clientIp, userAgent, "Failed")
			throw new UnauthorizedException("Email atau password yang Anda masukkan salah.")
		}

		if (user.isBlocked) {
			await this.recordAuthLog(user.id, dto.email, clientIp, userAgent, "Failed")
			throw new ForbiddenException("Akun admin Anda saat ini sedang nonaktif atau diblokir.")
		}

		const tokens = await this.generateTokens(user)
		await this.recordAuthLog(user.id, user.email, clientIp, userAgent, "Logged In")

		return {
			...tokens,
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

		const tokens = await this.generateTokens(user)
		await this.recordAuthLog(user.id, user.email, clientIp, userAgent, "Logged In")

		return {
			...tokens,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				gender: user.gender,
			},
		}
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
		return {
			...tokens,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				gender: user.gender,
			},
		}
	}

	async logout(userId: number, tokenId?: string, clientIp?: string, userAgent?: string): Promise<{ success: boolean; message: string }> {
		if (tokenId) {
			await this.redisService.revokeRefreshToken("admin", userId, tokenId)
		}
		const user = await this.userRepository.findOneBy({ id: userId })
		if (user) {
			await this.recordAuthLog(user.id, user.email, clientIp ?? "", userAgent, "Logged Out")
		}
		return { success: true, message: "Berhasil keluar dari sistem admin." }
	}

	async getProfile(userId: number): Promise<User> {
		const user = await this.userRepository.findOneBy({ id: userId })
		if (!user) throw new BadRequestException("User admin tidak ditemukan.")
		return user
	}

	async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
		const user = await this.getProfile(userId)
		if (dto.email && dto.email !== user.email) {
			const existing = await this.userRepository.findOneBy({ email: dto.email })
			if (existing) throw new BadRequestException("Email sudah digunakan oleh pengguna lain.")
		}

		user.name = dto.name ?? user.name
		user.email = dto.email ?? user.email
		if (dto.gender !== undefined) user.gender = dto.gender

		return this.userRepository.save(user)
	}

	async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ success: boolean; message: string }> {
		const user = await this.getProfile(userId)
		const dbHash = user.password?.trim().replace(/^\$2y\$/, "$2b$") ?? ""
		const isValid = await bcrypt.compare(dto.currentPassword, dbHash)
		if (!isValid) throw new BadRequestException("Password saat ini salah.")

		user.password = await bcrypt.hash(dto.newPassword, 10)
		user.weakPassword = dto.newPassword.length < 8
		await this.userRepository.save(user)

		return { success: true, message: "Password berhasil diperbarui." }
	}

	private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
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

		return { accessToken, refreshToken }
	}

	private async recordAuthLog(userId: number | null, email: string | null, ipAddress: string, userAgent?: string, status: "Logged In" | "Failed" | "Logged Out" = "Logged In"): Promise<void> {
		try {
			const log = this.authLogRepository.create({
				userId,
				email,
				ipAddress,
				userAgent: userAgent ?? null,
				guard: "admin",
				loginAt: status === "Logged In" ? new Date() : null,
				logoutAt: status === "Logged Out" ? new Date() : null,
				loginStatus: status,
			})
			await this.authLogRepository.save(log)
		} catch (err) {
			console.error("[AuthLog Error]", err)
		}
	}
}
