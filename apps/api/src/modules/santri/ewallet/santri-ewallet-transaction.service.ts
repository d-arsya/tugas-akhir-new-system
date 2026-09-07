import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common"
import { EwalletFacade } from "@modules/ewallet/ewallet.facade"
import type {
	ConfirmTopUpDto,
	TopUpBankTransferDto,
	TransactionFilterDto,
} from "@modules/ewallet/dto"

const EWALLETABLE_TYPE = "App\\Models\\Student"

@Injectable()
export class SantriEwalletTransactionService {
	constructor(private readonly ewalletFacade: EwalletFacade) {}

	private async getStudentEwallet(studentId: number) {
		const ewallet = await this.ewalletFacade.findEwallet(EWALLETABLE_TYPE, studentId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet santri belum terdaftar.")
		}
		return ewallet
	}

	async getTransactionList(studentId: number, filters: TransactionFilterDto) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletFacade.getTransactionList(ewallet.id, filters)
	}

	async getTransactionDetail(transactionId: number, studentId: number) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletFacade.getTransactionDetail(transactionId, ewallet.id)
	}

	async getTopUpBankInfo() {
		return this.ewalletFacade.getTopUpBankInfo()
	}

	async storeTopUpBankTransfer(studentId: number, dto: TopUpBankTransferDto) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletFacade.createTopUpBankTransfer(ewallet.id, dto.amount)
	}

	async getConfirmForm(transactionId: number, studentId: number) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletFacade.getConfirmForm(transactionId, ewallet.id)
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

		return this.ewalletFacade.confirmTopUpProof(transactionId, ewallet.id, {
			paymentDate: parsedDate,
			paymentNote: dto.paymentNote,
			file,
		})
	}

	async getCashInfo() {
		return this.ewalletFacade.getCashInfo()
	}

	async getWithdrawInfo() {
		return this.ewalletFacade.getWithdrawInfo()
	}

	async getPurchaseHistory(studentId: number, filters: TransactionFilterDto) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletFacade.getPurchaseHistory(ewallet.id, filters)
	}

	async getPurchaseDetail(transactionId: number, studentId: number) {
		const ewallet = await this.getStudentEwallet(studentId)
		return this.ewalletFacade.getPurchaseDetail(transactionId, ewallet.id)
	}
}
