import {
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EwalletTransactionDetail } from "@ewallet/entities/ewallet-transaction-detail.entity"
import { EwalletTransactionItem } from "@ewallet/entities/ewallet-transaction-item.entity"
import { EwalletTransaction } from "@ewallet/entities/ewallet-transaction.entity"
import { Ewallet } from "@ewallet/entities/ewallet.entity"

const STUDENT_EWALLETABLE_TYPE = "App\\Models\\Student"

@Injectable()
export class EwalletPurchaseQrService {
	constructor(
		@InjectRepository(Ewallet)
		private readonly ewalletRepository: Repository<Ewallet>,
		@InjectRepository(EwalletTransaction)
		private readonly ewalletTransactionRepository: Repository<EwalletTransaction>,
		@InjectRepository(EwalletTransactionDetail)
		private readonly ewalletTransactionDetailRepository: Repository<EwalletTransactionDetail>,
		@InjectRepository(EwalletTransactionItem)
		private readonly ewalletTransactionItemRepository: Repository<EwalletTransactionItem>,
	) {}

	async getPurchaseQrData(transactionId: number, merchantEwalletId: number, uniqueNumber: string) {
		const txn = await this.ewalletTransactionRepository.findOneBy({
			id: transactionId,
			ewalletId: String(merchantEwalletId),
		})
		if (!txn) {
			throw new NotFoundException("Transaksi tidak ditemukan.")
		}

		return {
			transactionId: txn.id,
			code: txn.code,
			amount: Number(txn.amount),
			status: txn.status,
			merchantUniqueNumber: uniqueNumber,
		}
	}

	async validateBuyerQrScan(transactionId: number, merchantEwalletId: number, scannedQrValue: string) {
		const txn = await this.ewalletTransactionRepository.findOneBy({
			id: transactionId,
			ewalletId: String(merchantEwalletId),
		})
		if (!txn) {
			throw new NotFoundException("Transaksi tidak ditemukan.")
		}

		const santriEwallet = await this.ewalletRepository.findOneBy({ uniqueId: scannedQrValue })
		if (!santriEwallet) {
			throw new NotFoundException("E-Wallet Santri tidak ditemukan.")
		}

		if (santriEwallet.ewalletableType !== STUDENT_EWALLETABLE_TYPE) {
			throw new UnprocessableEntityException("E-Wallet bukan milik Santri.")
		}

		if (!santriEwallet.isActive) {
			throw new UnprocessableEntityException("Hubungi Admin untuk mengaktifkan kembali E-Wallet Santri.")
		}

		let detail = await this.ewalletTransactionDetailRepository.findOneBy({
			ewalletTransactionId: String(txn.id),
		})

		if (!detail) {
			detail = this.ewalletTransactionDetailRepository.create({
				ewalletTransactionId: String(txn.id),
				ewalletId: String(santriEwallet.id),
			})
		} else {
			detail.ewalletId = String(santriEwallet.id)
		}

		await this.ewalletTransactionDetailRepository.save(detail)

		return {
			transactionId: txn.id,
			message: "Scan QR berhasil, melanjutkan ke halaman checkout.",
		}
	}

	async getPurchaseCheckoutData(transactionId: number, merchantEwalletId: number) {
		const txn = await this.ewalletTransactionRepository.findOneBy({
			id: transactionId,
			ewalletId: String(merchantEwalletId),
		})
		if (!txn) {
			throw new NotFoundException("Transaksi tidak ditemukan.")
		}

		const items = await this.ewalletTransactionItemRepository.findBy({
			ewalletTransactionId: String(txn.id),
		})

		const detail = await this.ewalletTransactionDetailRepository.findOneBy({
			ewalletTransactionId: String(txn.id),
		})

		let buyerName = "Santri"
		if (detail?.ewalletId) {
			const buyerEwallet = await this.ewalletRepository.findOneBy({ id: Number(detail.ewalletId) })
			if (buyerEwallet) {
				buyerName = buyerEwallet.ewalletableName ?? buyerEwallet.studentName ?? "Santri"
			}
		}

		const totalPrice = items.reduce((sum, item) => sum + Number(item.price ?? 0), 0)

		return {
			transactionId: txn.id,
			code: txn.code,
			status: txn.status,
			paymentMethod: txn.paymentMethod,
			buyerName,
			totalPrice: totalPrice > 0 ? totalPrice : Number(txn.amount),
			items: items.map((i) => ({
				id: i.id,
				description: i.description,
				price: i.price,
			})),
		}
	}
}
