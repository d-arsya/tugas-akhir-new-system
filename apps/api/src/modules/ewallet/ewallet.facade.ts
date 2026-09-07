import { Injectable } from "@nestjs/common"
import { EwalletService } from "@ewallet/ewallet.service"
import { EwalletTransactionService } from "@ewallet/ewallet-transaction.service"
import type { Ewallet } from "@ewallet/entities/ewallet.entity"
import type { TransactionFilterDto } from "@ewallet/dto/transaction-filter.dto"

@Injectable()
export class EwalletFacade {
	constructor(
		private readonly ewalletService: EwalletService,
		private readonly ewalletTransactionService: EwalletTransactionService,
	) {}

	// --- Wallet Management ---
	async findEwallet(ewalletableType: string, ewalletableId: string | number): Promise<Ewallet | null> {
		return this.ewalletService.findEwallet(ewalletableType, ewalletableId)
	}

	async createEwalletRecord(data: Partial<Ewallet>): Promise<Ewallet> {
		return this.ewalletService.createEwalletRecord(data)
	}

	async getEwalletStatus(ewalletableType: string, ewalletableId: string | number) {
		return this.ewalletService.getEwalletStatus(ewalletableType, ewalletableId)
	}

	async calculateBalance(ewalletId: number): Promise<number> {
		return this.ewalletService.calculateBalance(ewalletId)
	}

	// --- PIN Operations & Sessions ---
	async validateCurrentPin(
		ewalletableType: string,
		ewalletableId: string | number,
		pin: string | number,
	): Promise<Ewallet> {
		return this.ewalletService.validateCurrentPin(ewalletableType, ewalletableId, pin)
	}

	async updatePin(
		ewalletableType: string,
		ewalletableId: string | number,
		newPin: number | string,
	): Promise<Ewallet> {
		return this.ewalletService.updatePin(ewalletableType, ewalletableId, newPin)
	}

	async generateResetPinToken(ewalletableType: string, ewalletableId: string | number) {
		return this.ewalletService.generateResetPinToken(ewalletableType, ewalletableId)
	}

	async validateResetPinToken(
		ewalletableType: string,
		ewalletableId: string | number,
		rawToken: string,
	): Promise<Ewallet> {
		return this.ewalletService.validateResetPinToken(ewalletableType, ewalletableId, rawToken)
	}

	async resetPinWithToken(
		ewalletableType: string,
		ewalletableId: string | number,
		rawToken: string,
		newPin: number | string,
	): Promise<Ewallet> {
		return this.ewalletService.resetPinWithToken(ewalletableType, ewalletableId, rawToken, newPin)
	}

	async setPinSession(prefix: string, id: number | string, ttlSeconds?: number): Promise<void> {
		return this.ewalletService.setPinSession(prefix, id, ttlSeconds)
	}

	async hasPinSession(prefix: string, id: number | string): Promise<boolean> {
		return this.ewalletService.hasPinSession(prefix, id)
	}

	async clearPinSession(prefix: string, id: number | string): Promise<void> {
		return this.ewalletService.clearPinSession(prefix, id)
	}

	// --- Transactions ---
	async getTransactionList(ewalletId: number, filters: TransactionFilterDto) {
		return this.ewalletTransactionService.getTransactionList(ewalletId, filters)
	}

	async getTransactionDetail(transactionId: number, ewalletId: number) {
		return this.ewalletTransactionService.getTransactionDetail(transactionId, ewalletId)
	}

	async getTopUpBankInfo() {
		return this.ewalletTransactionService.getTopUpBankInfo()
	}

	async createTopUpBankTransfer(ewalletId: number, amount: number) {
		return this.ewalletTransactionService.createTopUpBankTransfer(ewalletId, amount)
	}

	async getConfirmForm(transactionId: number, ewalletId: number) {
		return this.ewalletTransactionService.getConfirmForm(transactionId, ewalletId)
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
		return this.ewalletTransactionService.confirmTopUpProof(transactionId, ewalletId, data)
	}

	async getCashInfo() {
		return this.ewalletTransactionService.getCashInfo()
	}

	async getWithdrawInfo() {
		return this.ewalletTransactionService.getWithdrawInfo()
	}

	async getPurchaseHistory(ewalletId: number, filters: TransactionFilterDto) {
		return this.ewalletTransactionService.getPurchaseHistory(ewalletId, filters)
	}

	async getPurchaseDetail(transactionId: number, ewalletId: number) {
		return this.ewalletTransactionService.getPurchaseDetail(transactionId, ewalletId)
	}
}
