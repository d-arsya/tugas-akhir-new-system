import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { Repository } from "typeorm"
import { RedisService } from "../../../core/redis/redis.service"
import { User } from "../entities/user.entity"
import { AuthLog } from "../entities/auth-log.entity"
import type { Env } from "../../../core/config/env.validation"
import type { JwtPayload } from "../../../core/auth/strategies/jwt.strategy"
import type { AdminLoginDto, ChangePasswordDto, UpdateProfileDto } from "../dto/admin-auth.dto"

export type AdminAuthResult = {
	accessToken: string
	refreshToken: string
	user: {
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

	async refreshToken(payload: JwtPayload): Promise<AdminAuthResult> {
		const user = await this.userRepository.findOneBy({ id: payload.sub })
		if (!user || user.isBlocked) {
			throw new UnauthorizedException("Akun tidak ditemukan atau telah diblokir.")
		}

		// Verify & revoke existing refresh token from Redis
		if (payload.tokenId) {
			const storedToken = await this.redisService.get(`refresh:admin:${user.id}:${payload.tokenId}`)
			if (!storedToken) {
				throw new UnauthorizedException("Refresh token tidak valid atau telah dicabut.")
			}
			await this.redisService.del(`refresh:admin:${user.id}:${payload.tokenId}`)
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
			await this.redisService.del(`refresh:admin:${userId}:${tokenId}`)
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
		await this.redisService.set(`refresh:admin:${user.id}:${tokenId}`, refreshToken, 604800)

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
