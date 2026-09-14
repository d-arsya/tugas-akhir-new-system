import { BadRequestException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { Repository } from "typeorm"
import type { Env } from "@core/config/env.validation"
import { MailerService } from "@core/mailer/mailer.service"
import type { SantriForgotPasswordDto } from "@santri/dto/auth/forgot-password.dto"
import type { SantriResetPasswordDto } from "@santri/dto/auth/reset-password.dto"
import { StudentPasswordReset } from "@santri/entities/student-password-reset.entity"
import { Student } from "@santri/entities/student.entity"

@Injectable()
export class SantriPasswordResetService {
	constructor(
		@InjectRepository(Student)
		private readonly studentRepository: Repository<Student>,
		@InjectRepository(StudentPasswordReset)
		private readonly passwordResetRepository: Repository<StudentPasswordReset>,
		private readonly configService: ConfigService<Env, true>,
		private readonly mailerService: MailerService,
	) {}

	async forgotPassword(dto: SantriForgotPasswordDto): Promise<{ message: string }> {
		const student = await this.studentRepository.findOneBy({ email: dto.email })
		if (!student) {
			return { message: "Jika email terdaftar, instruksi reset password telah dikirim ke email Anda." }
		}

		const token = crypto.randomBytes(32).toString("hex")

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

	async resetPassword(dto: SantriResetPasswordDto): Promise<{ message: string }> {
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
}
