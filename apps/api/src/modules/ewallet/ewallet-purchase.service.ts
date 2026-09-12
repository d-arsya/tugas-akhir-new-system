import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, Repository } from "typeorm"
import { MailerService } from "@core/mailer/mailer.service"
import { RedisService } from "@core/redis/redis.service"
import { EwalletTransactionDetail } from "@ewallet/entities/ewallet-transaction-detail.entity"
import { EwalletTransactionItem } from "@ewallet/entities/ewallet-transaction-item.entity"
import { EwalletTransaction } from "@ewallet/entities/ewallet-transaction.entity"
import { Ewallet } from "@ewallet/entities/ewallet.entity"
import { EwalletService } from "@ewallet/ewallet.service"

const STUDENT_EWALLETABLE_TYPE = "App\\Models\\Student"

@Injectable()
export class EwalletPurchaseService {
	constructor(
		@InjectRepository(Ewallet)
		private readonly ewalletRepository: Repository<Ewallet>,
		@InjectRepository(EwalletTransaction)
		private readonly ewalletTransactionRepository: Repository<EwalletTransaction>,
		@InjectRepository(EwalletTransactionDetail)
		private readonly ewalletTransactionDetailRepository: Repository<EwalletTransactionDetail>,
		@InjectRepository(EwalletTransactionItem)
		private readonly ewalletTransactionItemRepository: Repository<EwalletTransactionItem>,
		private readonly ewalletService: EwalletService,
		private readonly dataSource: DataSource,
		private readonly redisService: RedisService,
		private readonly mailerService: MailerService,
	) {}

	private async generatePurchaseCode(): Promise<string> {
		const prefix = "03"
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, "0")
		const day = String(now.getDate()).padStart(2, "0")
		const dateStr = `${year}${month}${day}`

		let increment = 1
		let code = ""
		while (true) {
			const seq = String(increment).padStart(4, "0")
			code = `${prefix}${dateStr}${seq}`

			const existing = await this.ewalletTransactionRepository.findOneBy({ code })
			if (!existing) {
				break
			}
			increment++
		}

		return code
	}

	async createPurchaseTransaction(
		merchantEwalletId: number,
		paymentAccount: string,
		paymentOnBehalfOf: string,
		items: Array<{ description: string; price: number }>,
	) {
		const code = await this.generatePurchaseCode()
		const totalAmount = items.reduce((sum, item) => sum + Number(item.price), 0)

		const queryRunner = this.dataSource.createQueryRunner()
		await queryRunner.connect()
		await queryRunner.startTransaction()

		try {
			const txn = queryRunner.manager.create(EwalletTransaction, {
				ewalletId: String(merchantEwalletId),
				code,
				name: "Purchase",
				type: "purchase",
				amount: String(totalAmount),
				status: "waiting",
				paymentMethod: "E-Wallet",
				paymentAccount,
				paymentOnBehalfOf,
			})
			await queryRunner.manager.save(txn)

			const itemsToSave = items.map((item) =>
				queryRunner.manager.create(EwalletTransactionItem, {
					ewalletTransactionId: String(txn.id),
					description: item.description,
					price: item.price,
				}),
			)
			await queryRunner.manager.save(itemsToSave)

			await queryRunner.commitTransaction()

			return {
				message: "Transaksi berhasil dibuat.",
				transactionId: txn.id,
				code: txn.code,
				totalAmount,
			}
		} catch (error) {
			await queryRunner.rollbackTransaction()
			throw error
		} finally {
			await queryRunner.release()
		}
	}

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

	async updatePurchaseItem(
		itemId: number,
		merchantEwalletId: number,
		data: { description: string; price: number },
	) {
		const item = await this.ewalletTransactionItemRepository.findOneBy({ id: itemId })
		if (!item) {
			throw new NotFoundException("Item transaksi tidak ditemukan.")
		}

		const txn = await this.ewalletTransactionRepository.findOneBy({
			id: Number(item.ewalletTransactionId),
			ewalletId: String(merchantEwalletId),
		})
		if (!txn || txn.status !== "waiting") {
			throw new BadRequestException("Transaksi ini tidak dapat diperbarui.")
		}

		item.description = data.description
		item.price = data.price
		await this.ewalletTransactionItemRepository.save(item)

		const items = await this.ewalletTransactionItemRepository.findBy({
			ewalletTransactionId: String(txn.id),
		})
		const currentTotal = items.reduce((sum, i) => sum + Number(i.price ?? 0), 0)

		txn.amount = String(currentTotal)
		await this.ewalletTransactionRepository.save(txn)

		return {
			message: "Item transaksi berhasil di-update.",
			currentTotal,
		}
	}

	async validatePurchasePin(transactionId: number, merchantEwalletId: number, pin: string) {
		const txn = await this.ewalletTransactionRepository.findOneBy({
			id: transactionId,
			ewalletId: String(merchantEwalletId),
		})
		if (!txn) {
			throw new NotFoundException("Transaksi tidak ditemukan.")
		}

		if (txn.status !== "waiting") {
			throw new BadRequestException("Transaksi ini sudah diproses.")
		}

		const detail = await this.ewalletTransactionDetailRepository.findOneBy({
			ewalletTransactionId: String(txn.id),
		})
		if (!detail || !detail.ewalletId) {
			throw new BadRequestException("Transaksi belum terhubung dengan QR Santri.")
		}

		const buyerEwallet = await this.ewalletRepository.findOneBy({ id: Number(detail.ewalletId) })
		if (!buyerEwallet) {
			throw new NotFoundException("E-Wallet Santri tidak ditemukan.")
		}

		const merchantEwallet = await this.ewalletRepository.findOneBy({ id: merchantEwalletId })
		if (!merchantEwallet) {
			throw new NotFoundException("E-Wallet Merchant tidak ditemukan.")
		}

		const attemptKey = `merchant-pin-attempt:${transactionId}`
		const currentAttemptsStr = await this.redisService.get(attemptKey)
		const currentAttempts = currentAttemptsStr ? Number(currentAttemptsStr) : 0

		// 1. PIN Check
		if (String(buyerEwallet.pin) !== String(pin)) {
			const attempts = currentAttempts + 1
			await this.redisService.set(attemptKey, String(attempts), 3600)

			if (attempts >= 3) {
				buyerEwallet.isActive = false
				await this.ewalletRepository.save(buyerEwallet)
				await this.redisService.del(attemptKey)

				return {
					isBlocked: true,
					message: "Terlalu banyak percobaan. E-Wallet Santri telah dinonaktifkan.",
				}
			}

			const remaining = 3 - attempts
			return {
				isWrongPin: true,
				attempts,
				remainingAttempts: remaining,
				message:
					remaining === 1
						? "Pin tidak cocok! Coba kesempatan terakhir."
						: `Pin tidak cocok! Coba dalam ${remaining} kali kesempatan.`,
			}
		}

		// 2. Balance Check
		const items = await this.ewalletTransactionItemRepository.findBy({
			ewalletTransactionId: String(txn.id),
		})
		const totalItemsPrice =
			items.length > 0
				? items.reduce((sum, i) => sum + Number(i.price ?? 0), 0)
				: Number(txn.amount)

		const buyerBalance = await this.ewalletService.calculateBalance(buyerEwallet.id)
		if (buyerBalance < totalItemsPrice) {
			return {
				isBalanceInsufficient: true,
				message: "Saldo Santri tidak cukup.",
			}
		}

		// 3. Process Payment in DB Transaction
		const queryRunner = this.dataSource.createQueryRunner()
		await queryRunner.connect()
		await queryRunner.startTransaction()

		try {
			txn.status = "valid"
			await queryRunner.manager.save(txn)

			// Snapshot balances
			const newMerchantBalance = await this.ewalletService.calculateBalance(merchantEwallet.id)
			const newBuyerBalance = await this.ewalletService.calculateBalance(buyerEwallet.id)

			merchantEwallet.totalBalance = String(newMerchantBalance)
			buyerEwallet.totalBalance = String(newBuyerBalance)

			await queryRunner.manager.save(merchantEwallet)
			await queryRunner.manager.save(buyerEwallet)

			await queryRunner.commitTransaction()
		} catch (error) {
			await queryRunner.rollbackTransaction()
			throw error
		} finally {
			await queryRunner.release()
		}

		// Clear Redis attempt key
		await this.redisService.del(attemptKey)

		return {
			success: true,
			message: "Pin sesuai. Transaksi berhasil dilakukan.",
		}
	}
}
