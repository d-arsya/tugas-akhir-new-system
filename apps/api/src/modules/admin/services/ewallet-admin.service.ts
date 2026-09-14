import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Ewallet } from "../../ewallet/entities/ewallet.entity"
import { EwalletTransaction } from "../../ewallet/entities/ewallet-transaction.entity"
import {
	TopUpEwalletDto,
	WithdrawEwalletDto,
	ResetPinDto,
	UpdateEwalletSettingDto,
	UpdateEwalletTxStatusDto,
} from "../dto/ewallet-admin.dto"

@Injectable()
export class EwalletAdminService {
	constructor(
		@InjectRepository(Ewallet)
		private readonly ewalletRepo: Repository<Ewallet>,
		@InjectRepository(EwalletTransaction)
		private readonly ewalletTxRepo: Repository<EwalletTransaction>,
	) {}

	async findAll(search?: string) {
		const qb = this.ewalletRepo.createQueryBuilder("e")
		if (search) {
			qb.where("e.student_name ILIKE :search OR e.unique_id::text ILIKE :search", { search: `%${search}%` })
		}
		qb.orderBy("e.id", "DESC")
		return qb.getMany()
	}

	async getWidgetStats() {
		const wallets = await this.ewalletRepo.find()
		let totalBalance = 0
		let activeCount = 0
		let blockedCount = 0

		for (const w of wallets) {
			totalBalance += Number(w.totalBalance || 0)
			if (w.isActive) activeCount++
			else blockedCount++
		}

		return { totalBalance, activeCount, blockedCount }
	}

	async findOne(id: number) {
		const wallet = await this.ewalletRepo.findOneBy({ id })
		if (!wallet) throw new NotFoundException(`E-wallet #${id} not found`)
		return wallet
	}

	async getTransactions(ewalletId: number) {
		return this.ewalletTxRepo.find({
			where: { ewalletId: String(ewalletId) },
			order: { id: "DESC" },
		})
	}

	async topUp(ewalletId: number, dto: TopUpEwalletDto) {
		const wallet = await this.findOne(ewalletId)
		const current = Number(wallet.totalBalance || 0)
		wallet.totalBalance = String(current + dto.amount)
		await this.ewalletRepo.save(wallet)

		const tx = this.ewalletTxRepo.create({
			ewalletId: String(ewalletId),
			type: "income",
			amount: String(dto.amount),
			status: "valid",
			paymentNote: dto.note ?? "Admin Top-up",
			paymentDate: new Date(),
			code: `TOP-${Date.now()}`,
		})

		return this.ewalletTxRepo.save(tx)
	}

	async withdraw(ewalletId: number, dto: WithdrawEwalletDto) {
		const wallet = await this.findOne(ewalletId)
		const current = Number(wallet.totalBalance || 0)
		if (current < dto.amount) {
			throw new BadRequestException("Saldo e-wallet tidak mencukupi")
		}

		wallet.totalBalance = String(current - dto.amount)
		await this.ewalletRepo.save(wallet)

		const tx = this.ewalletTxRepo.create({
			ewalletId: String(ewalletId),
			type: "expense",
			amount: String(dto.amount),
			status: "valid",
			paymentNote: dto.note ?? "Admin Withdraw",
			paymentDate: new Date(),
			code: `WDR-${Date.now()}`,
		})

		return this.ewalletTxRepo.save(tx)
	}

	async resetPin(ewalletId: number, dto: ResetPinDto) {
		const wallet = await this.findOne(ewalletId)
		const numericPin = parseInt(dto.newPin, 10)
		wallet.pin = isNaN(numericPin) ? 123456 : numericPin
		wallet.isActive = true
		await this.ewalletRepo.save(wallet)
		return { success: true, message: "PIN berhasil diperbarui" }
	}

	async updateSettings(ewalletId: number, dto: UpdateEwalletSettingDto) {
		const wallet = await this.findOne(ewalletId)
		if (dto.isActive !== undefined) wallet.isActive = dto.isActive
		if (dto.uniqueId !== undefined) wallet.uniqueId = dto.uniqueId
		return this.ewalletRepo.save(wallet)
	}

	async getGlobalTransactions() {
		return this.ewalletTxRepo.find({ order: { id: "DESC" }, take: 100 })
	}

	async updateTransactionStatus(id: number, dto: UpdateEwalletTxStatusDto) {
		const tx = await this.ewalletTxRepo.findOneBy({ id })
		if (!tx) throw new NotFoundException(`Transaction #${id} not found`)

		tx.status = dto.status
		if (dto.invalidNote) tx.invalidNote = dto.invalidNote
		return this.ewalletTxRepo.save(tx)
	}
}
