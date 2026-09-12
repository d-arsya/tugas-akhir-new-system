import { Injectable, NotFoundException } from "@nestjs/common"
import type { TransactionFilterDto } from "@modules/ewallet/dto"
import { EwalletFacade } from "@modules/ewallet/ewallet.facade"

const MERCHANT_EWALLETABLE_TYPE = "App\\Models\\Merchant"

@Injectable()
export class MerchantTransactionHistoryService {
	constructor(private readonly ewalletFacade: EwalletFacade) {}

	async getTransactionList(merchantId: number, filters: TransactionFilterDto) {
		const ewallet = await this.ewalletFacade.findEwallet(MERCHANT_EWALLETABLE_TYPE, merchantId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet merchant belum terdaftar.")
		}
		return this.ewalletFacade.getTransactionList(ewallet.id, filters)
	}

	async getTransactionDetail(transactionId: number, merchantId: number) {
		const ewallet = await this.ewalletFacade.findEwallet(MERCHANT_EWALLETABLE_TYPE, merchantId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet merchant belum terdaftar.")
		}
		return this.ewalletFacade.getTransactionDetail(transactionId, ewallet.id)
	}

	async getPurchaseHistory(merchantId: number, filters: TransactionFilterDto) {
		const ewallet = await this.ewalletFacade.findEwallet(MERCHANT_EWALLETABLE_TYPE, merchantId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet merchant belum terdaftar.")
		}
		// For merchants, purchase history means sales history where status is valid
		const validFilters: TransactionFilterDto = {
			...filters,
			status: "valid",
		}
		return this.ewalletFacade.getTransactionList(ewallet.id, validFilters)
	}

	async getPurchaseHistoryDetail(transactionId: number, merchantId: number) {
		const ewallet = await this.ewalletFacade.findEwallet(MERCHANT_EWALLETABLE_TYPE, merchantId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet merchant belum terdaftar.")
		}
		return this.ewalletFacade.getTransactionDetail(transactionId, ewallet.id)
	}
}
