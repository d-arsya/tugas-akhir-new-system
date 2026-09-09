import * as crypto from "node:crypto"
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import { Repository } from "typeorm"
import { RedisService } from "@core/redis/redis.service"
import { EwalletTransactionDetail } from "@ewallet/entities/ewallet-transaction-detail.entity"
import { EwalletTransactionItem } from "@ewallet/entities/ewallet-transaction-item.entity"
import { EwalletTransaction } from "@ewallet/entities/ewallet-transaction.entity"
import { Ewallet } from "@ewallet/entities/ewallet.entity"

@Injectable()
export class EwalletService {
	constructor(
		@InjectRepository(Ewallet)
		private readonly ewalletRepository: Repository<Ewallet>,
		@InjectRepository(EwalletTransaction)
		private readonly ewalletTransactionRepository: Repository<EwalletTransaction>,
		@InjectRepository(EwalletTransactionDetail)
		private readonly ewalletTransactionDetailRepository: Repository<EwalletTransactionDetail>,
		@InjectRepository(EwalletTransactionItem)
		private readonly ewalletTransactionItemRepository: Repository<EwalletTransactionItem>,
		private readonly redisService: RedisService,
	) {}

	async findEwallet(
		ewalletableType: string,
		ewalletableId: string | number,
	): Promise<Ewallet | null> {
		return this.ewalletRepository.findOneBy({
			ewalletableType,
			ewalletableId: String(ewalletableId),
		})
	}

	async createEwalletRecord(data: Partial<Ewallet>): Promise<Ewallet> {
		const entity = this.ewalletRepository.create(data)
		return this.ewalletRepository.save(entity)
	}

	async getEwalletStatus(
		ewalletableType: string,
		ewalletableId: string | number,
	): Promise<{ hasEwallet: boolean; isActive: boolean }> {
		const ewallet = await this.findEwallet(ewalletableType, ewalletableId)
		if (!ewallet) {
			return { hasEwallet: false, isActive: false }
		}
		return { hasEwallet: true, isActive: !!ewallet.isActive }
	}

	async calculateBalance(ewalletId: number): Promise<number> {
		const ownTransactions = await this.ewalletTransactionRepository.findBy({
			ewalletId: String(ewalletId),
			status: "valid",
		})

		let totalIncome = 0
		let totalExpense = 0

		for (const txn of ownTransactions) {
			const amt = Number(txn.amount ?? 0)
			if (txn.type === "income") {
				totalIncome += amt
			} else if (txn.type === "expense") {
				totalExpense += amt
			}
		}

		// Calculate purchase sum from transaction details where buyer is this ewalletId
		const purchaseDetails = await this.ewalletTransactionDetailRepository.findBy({
			ewalletId: String(ewalletId),
		})

		let totalPurchase = 0

		for (const detail of purchaseDetails) {
			if (detail.ewalletTransactionId) {
				const txn = await this.ewalletTransactionRepository.findOneBy({
					id: Number(detail.ewalletTransactionId),
					status: "valid",
					type: "purchase",
				})

				if (txn) {
					const items = await this.ewalletTransactionItemRepository.findBy({
						ewalletTransactionId: String(txn.id),
					})

					if (items.length > 0) {
						const itemsSum = items.reduce((acc, item) => acc + Number(item.price ?? 0), 0)
						totalPurchase += itemsSum
					} else {
						totalPurchase += Number(txn.amount ?? 0)
					}
				}
			}
		}

		return totalIncome - totalExpense - totalPurchase
	}

	async validateCurrentPin(
		ewalletableType: string,
		ewalletableId: string | number,
		pin: string | number,
	): Promise<Ewallet> {
		const ewallet = await this.findEwallet(ewalletableType, ewalletableId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet belum terdaftar.")
		}
		if (!ewallet.isActive) {
			throw new ForbiddenException("E-Wallet tidak aktif. Silakan hubungi admin.")
		}
		if (String(ewallet.pin) !== String(pin)) {
			throw new UnauthorizedException("PIN E-Wallet salah.")
		}
		return ewallet
	}

	async updatePin(
		ewalletableType: string,
		ewalletableId: string | number,
		newPin: number | string,
	): Promise<Ewallet> {
		const ewallet = await this.findEwallet(ewalletableType, ewalletableId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet belum terdaftar.")
		}
		ewallet.pin = Number(newPin)
		await this.ewalletRepository.save(ewallet)
		return ewallet
	}

	async generateResetPinToken(
		ewalletableType: string,
		ewalletableId: string | number,
	): Promise<{ rawToken: string; ewallet: Ewallet }> {
		const ewallet = await this.findEwallet(ewalletableType, ewalletableId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet belum terdaftar.")
		}

		const rawToken = crypto.randomBytes(5).toString("hex")
		const hashedToken = await bcrypt.hash(rawToken, 10)

		ewallet.resetPinToken = hashedToken
		ewallet.resetPinExpired = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiration
		await this.ewalletRepository.save(ewallet)

		return { rawToken, ewallet }
	}

	async validateResetPinToken(
		ewalletableType: string,
		ewalletableId: string | number,
		rawToken: string,
	): Promise<Ewallet> {
		const ewallet = await this.findEwallet(ewalletableType, ewalletableId)
		if (!ewallet) {
			throw new NotFoundException("E-Wallet belum terdaftar.")
		}

		if (!ewallet.resetPinToken || !ewallet.resetPinExpired) {
			throw new BadRequestException("Token reset PIN tidak valid.")
		}

		const isMatch = await bcrypt.compare(rawToken, ewallet.resetPinToken)
		if (!isMatch) {
			throw new BadRequestException("Token reset PIN tidak valid.")
		}

		if (new Date() > new Date(ewallet.resetPinExpired)) {
			throw new BadRequestException("Token reset PIN sudah kadaluarsa.")
		}

		return ewallet
	}

	async resetPinWithToken(
		ewalletableType: string,
		ewalletableId: string | number,
		rawToken: string,
		newPin: number | string,
	): Promise<Ewallet> {
		const ewallet = await this.validateResetPinToken(ewalletableType, ewalletableId, rawToken)
		ewallet.pin = Number(newPin)
		ewallet.resetPinToken = null
		ewallet.resetPinExpired = null
		await this.ewalletRepository.save(ewallet)
		return ewallet
	}

	async setPinSession(
		prefix: string,
		id: number | string,
		ttlSeconds = 8 * 60 * 60,
	): Promise<void> {
		await this.redisService.set(`${prefix}:${id}`, "1", ttlSeconds)
	}

	async hasPinSession(prefix: string, id: number | string): Promise<boolean> {
		const session = await this.redisService.get(`${prefix}:${id}`)
		return !!session
	}

	async clearPinSession(prefix: string, id: number | string): Promise<void> {
		await this.redisService.del(`${prefix}:${id}`)
	}
}
