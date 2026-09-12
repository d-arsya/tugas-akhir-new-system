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
import type { SantriForgotPasswordDto } from "@santri/dto/auth/forgot-password.dto"
import type { SantriLoginDto } from "@santri/dto/auth/login.dto"
import type { SantriResetPasswordDto } from "@santri/dto/auth/reset-password.dto"
import type { SantriTwoFactorDto } from "@santri/dto/auth/two-factor.dto"
import type { SantriUpdateEmailDto } from "@santri/dto/auth/update-email.dto"
import { StudentPasswordReset } from "@santri/entities/student-password-reset.entity"
import { Student } from "@santri/entities/student.entity"
import { TwoFactorStudent } from "@santri/entities/two-factor-student.entity"

export type SantriAuthResult =
	| { requires2fa: true; studentId: number; email: string | null }
	| {
		requires2fa: false
		accessToken: string
		refreshToken: string
		user: {
			id: number
			nis: string | null
			email: string | null
		}
	}

@Injectable()
export class SantriAuthService {
	constructor(
		@InjectRepository(Student)
		private readonly studentRepository: Repository<Student>,
		@InjectRepository(TwoFactorStudent)
		private readonly twoFactorRepository: Repository<TwoFactorStudent>,
		@InjectRepository(StudentPasswordReset)
		private readonly passwordResetRepository: Repository<StudentPasswordReset>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<Env, true>,
		private readonly redisService: RedisService,
		private readonly mailerService: MailerService,
	) { }

	private async generateTokens(student: Student) {
		const tokenId = crypto.randomUUID()
		const payload: JwtPayload = {
			sub: student.id,
			email: student.email ?? "",
			role: "santri",
			domain: "santri",
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
		await this.redisService.storeRefreshToken(student.id, tokenId, 7 * 24 * 60 * 60)

		return { accessToken, refreshToken }
	}

	async login(dto: SantriLoginDto, clientIp: string): Promise<SantriAuthResult> {
		const student = await this.studentRepository.findOneBy({ nis: dto.nis })
		if (!student || !student.password) {
			throw new UnauthorizedException("NIS atau password yang Anda masukkan salah.")
		}

		if (student.deletedAt) {
			throw new UnauthorizedException("Akun santri telah dinonaktifkan.")
		}

		const dbHash = student.password.trim().replace(/^\$2y\$/, "$2b$")
		const isPasswordValid = await bcrypt.compare(dto.password, dbHash)
		if (!isPasswordValid) {
			throw new UnauthorizedException("NIS atau password yang Anda masukkan salah.")
		}

		if (student.isBlocked) {
			throw new ForbiddenException("Akun santri Anda saat ini sedang dinonaktifkan atau diblokir.")
		}

		// 2FA Check if enabled
		if (student.enabled2fa && student.email) {
			const trustedRecord = await this.twoFactorRepository.findOneBy({
				studentId: String(student.id),
				twoFactorIp: clientIp,
			})

			if (!trustedRecord || !trustedRecord.twoFactorIp) {
				const code = Math.floor(100000 + Math.random() * 900000).toString()
				const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

				const record = this.twoFactorRepository.create({
					studentId: String(student.id),
					twoFactorIp: clientIp,
					twoFactorCode: code,
					twoFactorExpiresAt: expiresAt,
				})
				await this.twoFactorRepository.save(record)

				await this.mailerService.sendTwoFactorCode(student.email, {
					name: student.nis ?? "Santri",
					code,
				})

				return { requires2fa: true, studentId: student.id, email: student.email }
			}
		}

		const tokens = await this.generateTokens(student)

		return {
			requires2fa: false,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: student.id,
				nis: student.nis,
				email: student.email,
			},
		}
	}

	async verifyTwoFactor(
		dto: SantriTwoFactorDto,
		clientIp: string,
		studentId: number,
	): Promise<SantriAuthResult> {
		const student = await this.studentRepository.findOneBy({ id: studentId })
		if (!student) {
			throw new UnauthorizedException("Santri tidak ditemukan.")
		}

		const record = await this.twoFactorRepository.findOne({
			where: {
				studentId: String(studentId),
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

		const tokens = await this.generateTokens(student)

		return {
			requires2fa: false,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: student.id,
				nis: student.nis,
				email: student.email,
			},
		}
	}

	async resendTwoFactor(studentId: number, clientIp: string): Promise<{ message: string }> {
		const student = await this.studentRepository.findOneBy({ id: studentId })
		if (!student || !student.email) {
			throw new BadRequestException("Data santri atau email tidak ditemukan.")
		}

		const code = Math.floor(100000 + Math.random() * 900000).toString()
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

		const record = this.twoFactorRepository.create({
			studentId: String(student.id),
			twoFactorIp: clientIp,
			twoFactorCode: code,
			twoFactorExpiresAt: expiresAt,
		})
		await this.twoFactorRepository.save(record)

		await this.mailerService.sendTwoFactorCode(student.email, {
			name: student.nis ?? "Santri",
			code,
		})

		return { message: "Kode verifikasi 2FA baru telah dikirim ke email Anda." }
	}

	async forgotPassword(dto: SantriForgotPasswordDto): Promise<{ message: string }> {
		const student = await this.studentRepository.findOneBy({ email: dto.email })
		if (!student) {
			// Do not reveal email existence
			return { message: "Jika email terdaftar, instruksi reset password telah dikirim ke email Anda." }
		}

		const token = crypto.randomBytes(32).toString("hex")

		// Remove existing reset records for this email
		await this.passwordResetRepository.delete({ email: dto.email })

		const resetRecord = this.passwordResetRepository.create({
			email: dto.email,
			token,
			createdAt: new Date(),
		})
		await this.passwordResetRepository.save(resetRecord)

		const resetUrl = `${this.configService.get("SANTRI_URL", { infer: true })}/reset-password?token=${token}&email=${encodeURIComponent(dto.email)}`

		await this.mailerService.sendForgotPassword(dto.email, {
			name: student.nis ?? "Santri",
			resetUrl,
		})

		return { message: "Jika email terdaftar, instruksi reset password telah dikirim ke email Anda." }
	}

	async refreshToken(user: JwtPayload) {
		const student = await this.studentRepository.findOneBy({ id: user.sub })
		if (!student || student.deletedAt || student.isBlocked) {
			throw new UnauthorizedException("Sesi tidak valid.")
		}

		return this.generateTokens(student)
	}

	async resetPassword(dto: SantriResetPasswordDto): Promise<{ message: string }> {
		const resetRecord = await this.passwordResetRepository.findOneBy({
			email: dto.email,
			token: dto.token,
		})

		if (!resetRecord) {
			throw new BadRequestException("Token reset password tidak valid atau telah digunakan.")
		}

		// Check 24 hour expiry
		if (
			resetRecord.createdAt &&
			Date.now() - new Date(resetRecord.createdAt).getTime() > 24 * 60 * 60 * 1000
		) {
			await this.passwordResetRepository.delete({ email: dto.email, token: dto.token })
			throw new BadRequestException("Token reset password telah kadaluarsa.")
		}

		const student = await this.studentRepository.findOneBy({ email: dto.email })
		if (!student) {
			throw new BadRequestException("Akun santri tidak ditemukan.")
		}

		const passwordHash = await bcrypt.hash(dto.password, 10)
		student.password = passwordHash
		await this.studentRepository.save(student)

		await this.passwordResetRepository.delete({ email: dto.email })

		return { message: "Password berhasil diperbarui. Silakan login kembali." }
	}

	async sendEmailVerification(studentId: number): Promise<{ message: string }> {
		const student = await this.studentRepository.findOneBy({ id: studentId })
		if (!student || !student.email) {
			throw new BadRequestException("Email santri tidak ditemukan.")
		}

		const token = crypto.randomBytes(32).toString("hex")
		const key = `santri-email-verify:${student.id}`

		// Store in Redis for 1 hour (3600s)
		await this.redisService.set(key, token, 3600)

		const verifyUrl = `${this.configService.get("APP_URL", { infer: true })}/santri/auth/email/verify/${student.id}/${token}`

		await this.mailerService.sendEmailVerification(student.email, {
			name: student.nis ?? "Santri",
			verifyUrl,
		})

		return { message: "Email verifikasi telah dikirim ke " + student.email }
	}

	async verifyEmail(id: number, hash: string): Promise<{ message: string }> {
		const key = `santri-email-verify:${id}`
		const token = await this.redisService.get(key)

		if (!token || token !== hash) {
			throw new BadRequestException("Token verifikasi email tidak valid atau telah kadaluarsa.")
		}

		const student = await this.studentRepository.findOneBy({ id })
		if (!student) {
			throw new BadRequestException("Santri tidak ditemukan.")
		}

		student.emailVerifiedAt = new Date().toISOString()
		await this.studentRepository.save(student)
		await this.redisService.del(key)

		return { message: "Email berhasil diverifikasi." }
	}

	async getEmail(studentId: number) {
		const student = await this.studentRepository.findOneBy({ id: studentId })
		if (!student) {
			throw new UnauthorizedException("Santri tidak ditemukan.")
		}
		return {
			id: student.id,
			nis: student.nis,
			email: student.email,
			emailVerifiedAt: student.emailVerifiedAt,
		}
	}

	async updateEmail(
		studentId: number,
		dto: SantriUpdateEmailDto,
	): Promise<{ message: string }> {
		const existing = await this.studentRepository.findOneBy({ email: dto.email })
		if (existing && existing.id !== studentId) {
			throw new BadRequestException("Email sudah digunakan oleh akun lain.")
		}

		const student = await this.studentRepository.findOneBy({ id: studentId })
		if (!student) {
			throw new UnauthorizedException("Santri tidak ditemukan.")
		}

		student.email = dto.email
		student.emailVerifiedAt = null
		await this.studentRepository.save(student)

		await this.sendEmailVerification(studentId)

		return { message: "Email berhasil diperbarui. Silakan cek email Anda untuk verifikasi." }
	}

	async logout(studentId: number, tokenId?: string): Promise<{ message: string }> {
		if (tokenId) {
			await this.redisService.revokeRefreshToken(studentId, tokenId)
		}
		return { message: "Berhasil keluar." }
	}
}
