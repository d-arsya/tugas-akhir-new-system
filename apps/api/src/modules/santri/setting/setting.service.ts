import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import { Repository } from "typeorm"
import { SantriAuthService } from "@santri/auth/santri-auth.service"
import type { ChangePasswordDto } from "@santri/dto/setting/change-password.dto"
import type { Toggle2faDto } from "@santri/dto/setting/toggle-2fa.dto"
import { Student } from "@santri/entities/student.entity"

@Injectable()
export class SettingService {
	constructor(
		@InjectRepository(Student)
		private readonly studentRepository: Repository<Student>,
		private readonly santriAuthService: SantriAuthService,
	) {}

	async getSettingPage(studentId: number) {
		const student = await this.studentRepository.findOne({
			where: { id: studentId },
		})

		if (!student) {
			throw new NotFoundException("Data santri tidak ditemukan")
		}

		return {
			email: student.email,
			isEmailVerified: !!student.emailVerifiedAt,
			emailVerifiedAt: student.emailVerifiedAt,
			enabled2fa: student.enabled2fa,
		}
	}

	async changePassword(studentId: number, dto: ChangePasswordDto) {
		if (dto.password !== dto.passwordConfirmation) {
			throw new BadRequestException("Konfirmasi password tidak cocok")
		}

		const student = await this.studentRepository.findOne({
			where: { id: studentId },
		})

		if (!student) {
			throw new NotFoundException("Data santri tidak ditemukan")
		}

		const hashedPassword = await bcrypt.hash(dto.password, 10)
		student.password = hashedPassword
		await this.studentRepository.save(student)

		return { message: "Password berhasil diperbarui." }
	}

	async toggle2fa(studentId: number, dto: Toggle2faDto) {
		const student = await this.studentRepository.findOne({
			where: { id: studentId },
		})

		if (!student) {
			throw new NotFoundException("Data santri tidak ditemukan")
		}

		student.enabled2fa = dto.enabled
		await this.studentRepository.save(student)

		return {
			message: `Autentikasi 2FA berhasil ${dto.enabled ? "diaktifkan" : "dinonaktifkan"}.`,
			enabled2fa: student.enabled2fa,
		}
	}

	async resendVerification(studentId: number) {
		const student = await this.studentRepository.findOne({
			where: { id: studentId },
		})

		if (!student) {
			throw new NotFoundException("Data santri tidak ditemukan")
		}

		if (student.emailVerifiedAt) {
			throw new BadRequestException("Email santri sudah terverifikasi.")
		}

		return this.santriAuthService.sendEmailVerification(studentId)
	}
}
