import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common"
import { EwalletTransactionService } from "../../ewallet/ewallet-transaction.service"
import { EwalletService } from "../../ewallet/ewallet.service"
import type {
	ConfirmTopUpDto,
	TopUpBankTransferDto,
	TransactionFilterDto,
} from "../../ewallet/dto"

const EWALLETABLE_TYPE = "App\\Models\\Student"

@Injectable()
export class SantriEwalletTransactionService {
	constructor(
		private readonly ewalletService: EwalletService,
		private readonly ewalletTransactionService: EwalletTransactionService,
	) {}

	private async getStudentEwallet(studentId: number) {
		const ewallet = await this.ewalletService.findEwallet(EWALLETABLE_TYPE, studentId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet santri belum terdaftar.")
		}
		return ewallet
	}

	async getTransactionList(studentId: number, filters: TransactionFilterDto) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletTransactionService.getTransactionList(ewallet.id, filters)
	}

	async getTransactionDetail(transactionId: number, studentId: number) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletTransactionService.getTransactionDetail(transactionId, ewallet.id)
	}

	async getTopUpBankInfo() {
		return this.ewalletTransactionService.getTopUpBankInfo()
	}

	async storeTopUpBankTransfer(studentId: number, dto: TopUpBankTransferDto) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletTransactionService.createTopUpBankTransfer(ewallet.id, dto.amount)
	}

	async getConfirmForm(transactionId: number, studentId: number) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletTransactionService.getConfirmForm(transactionId, ewallet.id)
	}

	async confirmTopUp(
		transactionId: number,
		studentId: number,
		dto: ConfirmTopUpDto,
		file?: Express.Multer.File,
	) {
		const ewallet = await this.getStudentEwallet(studentId)

		let parsedDate: Date
		if (dto.paymentDate.includes("/")) {
			const [dayStr, monthStr, yearStr] = dto.paymentDate.split("/")
			if (dayStr && monthStr && yearStr) {
				const day = parseInt(dayStr, 10)
				const month = parseInt(monthStr, 10) - 1
				const year = parseInt(yearStr, 10)
				parsedDate = new Date(year, month, day)
			} else {
				parsedDate = new Date(dto.paymentDate)
			}
		} else {
			parsedDate = new Date(dto.paymentDate)
		}

		if (isNaN(parsedDate.getTime())) {
			throw new BadRequestException(
				"Format tanggal transfer tidak valid. Gunakan YYYY-MM-DD atau DD/MM/YYYY.",
			)
		}

		return this.ewalletTransactionService.confirmTopUpProof(transactionId, ewallet.id, {
			paymentDate: parsedDate,
			paymentNote: dto.paymentNote,
			file,
		})
	}

	async getCashInfo() {
		return this.ewalletTransactionService.getCashInfo()
	}

	async getWithdrawInfo() {
		return this.ewalletTransactionService.getWithdrawInfo()
	}

	async getPurchaseHistory(studentId: number, filters: TransactionFilterDto) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletTransactionService.getPurchaseHistory(ewallet.id, filters)
	}

	async getPurchaseDetail(transactionId: number, studentId: number) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletTransactionService.getPurchaseDetail(transactionId, ewallet.id)
	}
}
