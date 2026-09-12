import {
	Injectable,
	NotFoundException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EwalletFacade } from "@ewallet/ewallet.facade"
import type {
	StoreTransactionDto,
	UpdateTransactionItemDto,
	ValidateCheckoutPinDto,
} from "@merchant/dto/transaction"
import { Merchant } from "@merchant/entities/merchant.entity"

const MERCHANT_EWALLETABLE_TYPE = "App\\Models\\Merchant"

@Injectable()
export class MerchantTransactionService {
	constructor(
		private readonly ewalletFacade: EwalletFacade,
		@InjectRepository(Merchant)
		private readonly merchantRepository: Repository<Merchant>,
	) {}

	private async getMerchantEwallet(merchantId: number) {
		const ewallet = await this.ewalletFacade.findEwallet(MERCHANT_EWALLETABLE_TYPE, merchantId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet merchant belum terdaftar.")
		}
		return ewallet
	}

	async createTransaction(merchantId: number, dto: StoreTransactionDto) {
		const ewallet = await this.getMerchantEwallet(merchantId)
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })

		const paymentAccount = merchant?.uniqueNumber ?? ewallet.uniqueId ?? ""
		const paymentOnBehalfOf = merchant?.merchantName ?? merchant?.name ?? "Merchant"

		return this.ewalletFacade.createPurchaseTransaction(
			ewallet.id,
			paymentAccount,
			paymentOnBehalfOf,
			dto.items,
		)
	}

	async getQrPageData(transactionId: number, merchantId: number) {
		const ewallet = await this.getMerchantEwallet(merchantId)
		const merchant = await this.merchantRepository.findOneBy({ id: merchantId })
		const uniqueNumber = merchant?.uniqueNumber ?? ewallet.uniqueId ?? ""

		return this.ewalletFacade.getPurchaseQrData(transactionId, ewallet.id, uniqueNumber)
	}

	async validateScan(transactionId: number, scannedQrValue: string, merchantId: number) {
		const ewallet = await this.getMerchantEwallet(merchantId)
		return this.ewalletFacade.validateBuyerQrScan(transactionId, ewallet.id, scannedQrValue)
	}

	async getCheckoutData(transactionId: number, merchantId: number) {
		const ewallet = await this.getMerchantEwallet(merchantId)
		return this.ewalletFacade.getPurchaseCheckoutData(transactionId, ewallet.id)
	}

	async updateTransactionItem(itemId: number, dto: UpdateTransactionItemDto, merchantId: number) {
		const ewallet = await this.getMerchantEwallet(merchantId)
		return this.ewalletFacade.updatePurchaseItem(itemId, ewallet.id, dto)
	}

	async validatePin(transactionId: number, dto: ValidateCheckoutPinDto, merchantId: number) {
		const ewallet = await this.getMerchantEwallet(merchantId)
		return this.ewalletFacade.validatePurchasePin(transactionId, ewallet.id, dto.pin)
	}
}
