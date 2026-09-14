import { Injectable } from "@nestjs/common"
import type { TransactionFilterDto } from "@ewallet/dto/transaction-filter.dto"
import { EwalletTopUpService } from "./services/ewallet-topup.service"
import { EwalletTransactionQueryService } from "./services/ewallet-transaction-query.service"

@Injectable()
export class EwalletTransactionService {
	constructor(
		private readonly queryService: EwalletTransactionQueryService,
		private readonly topUpService: EwalletTopUpService,
	) {}

	async getTransactionList(ewalletId: number, filters: TransactionFilterDto) {
		return this.queryService.getTransactionList(ewalletId, filters)
	}

	async getTransactionDetail(transactionId: number, ewalletId: number) {
		return this.queryService.getTransactionDetail(transactionId, ewalletId)
	}

	async getTopUpBankInfo() {
		return this.topUpService.getTopUpBankInfo()
	}

	async createTopUpBankTransfer(ewalletId: number, amount: number) {
		return this.topUpService.createTopUpBankTransfer(ewalletId, amount)
	}

	async getConfirmForm(transactionId: number, ewalletId: number) {
		return this.queryService.getTransactionDetail(transactionId, ewalletId)
	}

	async confirmTopUpProof(
		transactionId: number,
		ewalletId: number,
		data: {
			paymentDate: Date
			paymentNote?: string | null | undefined
			file?: Express.Multer.File | undefined
		},
	) {
		return this.topUpService.confirmTopUpProof(transactionId, ewalletId, data)
	}

	async getCashInfo() {
		return this.topUpService.getCashInfo()
	}

	async getWithdrawInfo() {
		return this.topUpService.getWithdrawInfo()
	}

	async getPurchaseHistory(ewalletId: number, filters: TransactionFilterDto) {
		return this.queryService.getPurchaseHistory(ewalletId, filters)
	}

	async getPurchaseDetail(transactionId: number, ewalletId: number) {
		return this.queryService.getPurchaseDetail(transactionId, ewalletId)
	}
}
