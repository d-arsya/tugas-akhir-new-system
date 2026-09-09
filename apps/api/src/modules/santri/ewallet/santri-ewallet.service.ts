import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import type { Env } from "@core/config/env.validation"
import { MailerService } from "@core/mailer/mailer.service"
import type {
	ResetPinDto,
	SantriCreateEwalletDto,
	SantriLoginPinDto,
	TransactionFilterDto,
	UpdatePinDto,
	ValidateCurrentPinDto,
} from "@modules/ewallet/dto"
import { EwalletFacade } from "@modules/ewallet/ewallet.facade"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { Student } from "@santri/entities/student.entity"

const EWALLETABLE_TYPE = "App\\Models\\Student"
const PIN_SESSION_PREFIX = "santri-ewallet-pin"

@Injectable()
export class SantriEwalletService {
	constructor(
		private readonly ewalletFacade: EwalletFacade,
		@InjectRepository(Student)
		private readonly studentRepository: Repository<Student>,
		@InjectRepository(StudentGrade)
		private readonly studentGradeRepository: Repository<StudentGrade>,
		private readonly configService: ConfigService<Env, true>,
		private readonly mailerService: MailerService,
	) {}

	async getEwalletStatus(studentId: number) {
		return this.ewalletFacade.getEwalletStatus(EWALLETABLE_TYPE, studentId)
	}

	async loginPin(studentId: number, dto: SantriLoginPinDto) {
		await this.ewalletFacade.validateCurrentPin(EWALLETABLE_TYPE, studentId, dto.pin)
		await this.ewalletFacade.setPinSession(PIN_SESSION_PREFIX, studentId)
		return { message: "Berhasil verifikasi PIN E-Wallet." }
	}

	async createEwallet(studentId: number, dto: SantriCreateEwalletDto) {
		const existing = await this.ewalletFacade.findEwallet(EWALLETABLE_TYPE, studentId)
		if (existing) {
			throw new ForbiddenException("Santri sudah memiliki E-Wallet.")
		}

		const student = await this.studentRepository.findOneBy({ id: studentId })
		const grade = await this.studentGradeRepository.findOneBy({
			studentId,
			gradeStatus: "active",
		})

		await this.ewalletFacade.createEwalletRecord({
			uniqueId: student?.nis ?? String(studentId),
			ewalletableType: EWALLETABLE_TYPE,
			ewalletableId: String(studentId),
			studentName: grade?.fullname ?? student?.nis ?? null,
			ewalletableName: grade?.fullname ?? student?.nis ?? null,
			studentGradeLevel: grade?.levelId ? String(grade.levelId) : null,
			studentGradeNumber: grade?.grade ? String(grade.grade) : null,
			studentFatherFullname: grade?.fatherFullname ?? null,
			pin: Number(dto.pin),
			isActive: true,
			totalBalance: "0",
		})

		await this.ewalletFacade.setPinSession(PIN_SESSION_PREFIX, studentId)

		return { message: "E-Wallet berhasil dibuat." }
	}

	async showInactivePage(studentId: number) {
		const ewallet = await this.ewalletFacade.findEwallet(EWALLETABLE_TYPE, studentId)
		if (!ewallet) {
			return { isActive: false, message: "E-Wallet belum terdaftar." }
		}

		return {
			isActive: !!ewallet.isActive,
			message: ewallet.isActive
				? "E-Wallet aktif."
				: "E-Wallet Anda saat ini dinonaktifkan. Silakan hubungi pengelola pondok.",
		}
	}

	async getDashboard(studentId: number, filters?: TransactionFilterDto) {
		const ewallet = await this.ewalletFacade.findEwallet(EWALLETABLE_TYPE, studentId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet belum terdaftar.")
		}

		const totalBalance = await this.ewalletFacade.calculateBalance(ewallet.id)
		const txListResult = await this.ewalletFacade.getTransactionList(ewallet.id, filters ?? ({} as TransactionFilterDto))

		return {
			data: {
				totalBalance,
				ewallet: {
					id: ewallet.id,
					uniqueId: ewallet.uniqueId,
					studentName: ewallet.studentName,
					studentGradeLevel: ewallet.studentGradeLevel,
					studentGradeNumber: ewallet.studentGradeNumber,
					isActive: ewallet.isActive,
				},
				transactions: txListResult.data,
			},
			meta: txListResult.meta,
		}
	}

	async validateCurrentPin(studentId: number, dto: ValidateCurrentPinDto) {
		await this.ewalletFacade.validateCurrentPin(EWALLETABLE_TYPE, studentId, dto.pin)
		return { message: "PIN E-Wallet valid." }
	}

	async updatePin(studentId: number, dto: UpdatePinDto) {
		await this.ewalletFacade.updatePin(EWALLETABLE_TYPE, studentId, dto.pin)
		await this.ewalletFacade.setPinSession(PIN_SESSION_PREFIX, studentId)
		return { message: "PIN E-Wallet berhasil diperbarui." }
	}

	async sendPinResetEmail(studentId: number) {
		const { rawToken } = await this.ewalletFacade.generateResetPinToken(
			EWALLETABLE_TYPE,
			studentId,
		)

		const student = await this.studentRepository.findOneBy({ id: studentId })
		if (!student || !student.email) {
			throw new NotFoundException("Email santri tidak ditemukan.")
		}

		const grade = await this.studentGradeRepository.findOneBy({
			studentId,
			gradeStatus: "active",
		})
		const recipientName = grade?.fullname ?? student.nis ?? "Santri"

		const appUrl = (
			this.configService.get("APP_URL", { infer: true }) || "http://localhost:4200"
		).replace(/\/+$/, "")
		const resetUrl = `${appUrl}/e-wallet/pin/reset/${rawToken}`

		await this.mailerService.sendResetPin(student.email, {
			name: recipientName,
			resetUrl,
		})

		return { message: "Email instruksi reset PIN telah dikirim." }
	}

	async validatePinResetToken(studentId: number, token: string) {
		await this.ewalletFacade.validateResetPinToken(EWALLETABLE_TYPE, studentId, token)
		return { valid: true, message: "Token reset PIN valid." }
	}

	async resetPin(studentId: number, dto: ResetPinDto) {
		await this.ewalletFacade.resetPinWithToken(
			EWALLETABLE_TYPE,
			studentId,
			dto.token,
			dto.pin,
		)
		await this.ewalletFacade.setPinSession(PIN_SESSION_PREFIX, studentId)
		return { message: "PIN E-Wallet berhasil direset." }
	}
}
