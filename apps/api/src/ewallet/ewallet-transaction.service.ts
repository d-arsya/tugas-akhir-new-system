import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { StorageService } from "../core/storage/storage.service"
import type { TransactionFilterDto } from "./dto/transaction-filter.dto"
import { EwalletTransactionDetail } from "./entities/ewallet-transaction-detail.entity"
import { EwalletTransactionItem } from "./entities/ewallet-transaction-item.entity"
import { EwalletTransaction } from "./entities/ewallet-transaction.entity"
import { Ewallet } from "./entities/ewallet.entity"

@Injectable()
export class EwalletTransactionService {
	constructor(
		@InjectRepository(Ewallet)
		private readonly ewalletRepository: Repository<Ewallet>,
		@InjectRepository(EwalletTransaction)
		private readonly ewalletTransactionRepository: Repository<EwalletTransaction>,
		@InjectRepository(EwalletTransactionDetail)
		private readonly ewalletTransactionDetailRepository: Repository<EwalletTransactionDetail>,
		@InjectRepository(EwalletTransactionItem)
		private readonly ewalletTransactionItemRepository: Repository<EwalletTransactionItem>,
		private readonly storageService: StorageService,
	) {}

	private mapTypeLabel(type: string | null, name?: string | null): string {
		if (type === "purchase" || name === "Purchase") return "Jual Beli"
		if (type === "income") return "Pemasukan"
		if (type === "expense") return "Pengeluaran"
		return type ?? "-"
	}

	private mapStatusLabel(status: string | null): string {
		switch (status) {
			case "valid":
				return "Berhasil"
			case "process":
				return "Diproses"
			case "waiting":
				return "Menunggu"
			case "invalid":
				return "Dibatalkan"
			default:
				return status ?? "-"
		}
	}

	async getTransactionList(ewalletId: number, filters: TransactionFilterDto) {
		const ownTxns = await this.ewalletTransactionRepository.findBy({
			ewalletId: String(ewalletId),
		})

		const purchaseDetails = await this.ewalletTransactionDetailRepository.findBy({
			ewalletId: String(ewalletId),
		})

		const purchaseTxnIds = purchaseDetails
			.map((d) => (d.ewalletTransactionId ? Number(d.ewalletTransactionId) : null))
			.filter((id): id is number => id !== null)

		let purchaseTxns: EwalletTransaction[] = []
		if (purchaseTxnIds.length > 0) {
			const found = await Promise.all(
				purchaseTxnIds.map((id) => this.ewalletTransactionRepository.findOneBy({ id })),
			)
			purchaseTxns = found.filter((t): t is EwalletTransaction => t !== null)
		}

		// Combine unique transactions
		const map = new Map<number, EwalletTransaction>()
		for (const txn of ownTxns) {
			map.set(txn.id, txn)
		}
		for (const txn of purchaseTxns) {
			map.set(txn.id, txn)
		}

		let allTxns = Array.from(map.values())

		// Filter by status if provided
		if (filters.status) {
			allTxns = allTxns.filter((txn) => txn.status === filters.status)
		}

		// Filter by dateStart
		if (filters.dateStart) {
			const start = new Date(filters.dateStart).getTime()
			allTxns = allTxns.filter((txn) => new Date(txn.createdAt).getTime() >= start)
		}

		// Filter by dateEnd
		if (filters.dateEnd) {
			const end = new Date(filters.dateEnd).getTime() + 24 * 60 * 60 * 1000
			allTxns = allTxns.filter((txn) => new Date(txn.createdAt).getTime() <= end)
		}

		// Sort by createdAt DESC
		allTxns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

		// Pagination calculation
		const total = allTxns.length
		const page = filters.page ?? 1
		const limit = filters.limit ?? 10
		const totalPages = Math.ceil(total / limit) || 1
		const startIndex = (page - 1) * limit
		const paginatedTxns = allTxns.slice(startIndex, startIndex + limit)

		const items = paginatedTxns.map((txn) => ({
			id: txn.id,
			code: txn.code,
			name: txn.name === "Purchase" ? "Jual Beli" : txn.name,
			type: txn.type,
			typeLabel: this.mapTypeLabel(txn.type, txn.name),
			amount: txn.amount,
			status: txn.status,
			statusLabel: this.mapStatusLabel(txn.status),
			paymentMethod: txn.paymentMethod,
			paymentDate: txn.paymentDate ? txn.paymentDate.toISOString() : null,
			createdAt: txn.createdAt.toISOString(),
		}))

		return {
			data: items,
			meta: {
				page,
				limit,
				total,
				totalPages,
			},
		}
	}

	async getTransactionDetail(transactionId: number, ewalletId: number) {
		const txn = await this.ewalletTransactionRepository.findOneBy({ id: transactionId })
		if (!txn) {
			throw new NotFoundException("Transaksi tidak ditemukan.")
		}

		// Verify ownership
		const isOwner = txn.ewalletId === String(ewalletId)
		const isBuyerDetail = await this.ewalletTransactionDetailRepository.findOneBy({
			ewalletId: String(ewalletId),
			ewalletTransactionId: String(txn.id),
		})

		if (!isOwner && !isBuyerDetail) {
			throw new ForbiddenException("Anda tidak memiliki akses ke transaksi ini.")
		}

		let items: EwalletTransactionItem[] = []
		if (txn.type === "purchase") {
			items = await this.ewalletTransactionItemRepository.findBy({
				ewalletTransactionId: String(txn.id),
			})
		}

		const attachmentUrl = txn.paymentAttachment
			? this.storageService.getUrl(txn.paymentAttachment)
			: null

		return {
			id: txn.id,
			code: txn.code,
			name: txn.name === "Purchase" ? "Jual Beli" : txn.name,
			type: txn.type,
			typeLabel: this.mapTypeLabel(txn.type, txn.name),
			amount: txn.amount,
			status: txn.status,
			statusLabel: this.mapStatusLabel(txn.status),
			paymentMethod: txn.paymentMethod,
			paymentAccount: txn.paymentAccount,
			paymentOnBehalfOf: txn.paymentOnBehalfOf,
			paymentAttachment: attachmentUrl,
			paymentDate: txn.paymentDate ? txn.paymentDate.toISOString() : null,
			transferNewsNumber: txn.transferNewsNumber,
			paymentNote: txn.paymentNote,
			invalidNote: txn.invalidNote,
			createdAt: txn.createdAt.toISOString(),
			items: items.map((item) => ({
				id: item.id,
				description: item.description ?? "-",
				price: item.price ?? 0,
			})),
		}
	}

	async getTopUpBankInfo() {
		return {
			bankName: "BSI (Bank Syariah Indonesia)",
			accountNumber: "9898 6652 2522 888",
			accountName: "Tabungan Pondok ROJA",
			minAmount: 1000,
			note: "Transfer sesuai nominal lalu sertakan bukti transfer saat melakukan konfirmasi.",
		}
	}

	async createTopUpBankTransfer(ewalletId: number, amount: number) {
		if (amount < 1000) {
			throw new BadRequestException("Nominal top-up minimal Rp 1.000")
		}

		const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
		const randomInt = Math.floor(1000 + Math.random() * 9000)
		const code = `INC-${nowStr}-${randomInt}`
		const transferNewsNumber = Math.floor(10 + Math.random() * 90)

		const txn = this.ewalletTransactionRepository.create({
			ewalletId: String(ewalletId),
			code,
			name: "Isi saldo",
			type: "income",
			amount: String(amount),
			status: "waiting",
			paymentMethod: "Bank Transfer (Manual)",
			paymentAccount: "BSI 9898 6652 2522 888",
			paymentOnBehalfOf: "Tabungan Pondok ROJA",
			transferNewsNumber,
		})

		await this.ewalletTransactionRepository.save(txn)

		return {
			transactionId: txn.id,
			code: txn.code,
			amount,
			transferNewsNumber,
			paymentAccount: "BSI 9898 6652 2522 888",
			paymentOnBehalfOf: "Tabungan Pondok ROJA",
			message:
				"Transaksi isi saldo berhasil dibuat. Silakan lakukan transfer bank lalu unggah bukti pembayaran.",
		}
	}

	async getConfirmForm(transactionId: number, ewalletId: number) {
		const detail = await this.getTransactionDetail(transactionId, ewalletId)
		if (detail.status !== "waiting") {
			throw new BadRequestException("Transaksi ini tidak dalam status menunggu pembayaran.")
		}
		return detail
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
		const txn = await this.ewalletTransactionRepository.findOneBy({
			id: transactionId,
			ewalletId: String(ewalletId),
		})

		if (!txn) {
			throw new NotFoundException("Transaksi tidak ditemukan.")
		}

		if (txn.status !== "waiting") {
			throw new BadRequestException("Transaksi tidak dalam status menunggu pembayaran.")
		}

		if (!data.file) {
			throw new BadRequestException("File bukti transfer wajib diunggah.")
		}

		const uploadedPath = await this.storageService.upload(data.file, "top-up-proofs")

		txn.status = "process"
		txn.paymentAmount = txn.amount
		txn.paymentAttachment = uploadedPath
		txn.paymentDate = data.paymentDate
		txn.paymentNote = data.paymentNote ?? null

		await this.ewalletTransactionRepository.save(txn)

		return {
			message:
				"Bukti pembayaran berhasil diunggah. Transaksi isi saldo Anda sedang diproses oleh admin.",
		}
	}

	async getCashInfo() {
		return {
			title: "Isi Saldo Tunai",
			description:
				"Silakan kunjungi Kasir / Pengelola E-Wallet Pondok ROJA untuk melakukan pengisian saldo secara tunai.",
		}
	}

	async getWithdrawInfo() {
		return {
			title: "Tarik Saldo E-Wallet",
			description:
				"Penarikan saldo E-Wallet dapat dilakukan secara langsung di Kantor Pengelola E-Wallet Pondok ROJA.",
		}
	}

	async getPurchaseHistory(ewalletId: number, filters: TransactionFilterDto) {
		const details = await this.ewalletTransactionDetailRepository.findBy({
			ewalletId: String(ewalletId),
		})

		const txnIds = details
			.map((d) => (d.ewalletTransactionId ? Number(d.ewalletTransactionId) : null))
			.filter((id): id is number => id !== null)

		let txns: EwalletTransaction[] = []
		if (txnIds.length > 0) {
			const found = await Promise.all(
				txnIds.map((id) => this.ewalletTransactionRepository.findOneBy({ id })),
			)
			txns = found.filter((t): t is EwalletTransaction => t !== null)
		}

		if (filters.status) {
			txns = txns.filter((t) => t.status === filters.status)
		}

		if (filters.dateStart) {
			const start = new Date(filters.dateStart).getTime()
			txns = txns.filter((t) => new Date(t.createdAt).getTime() >= start)
		}

		if (filters.dateEnd) {
			const end = new Date(filters.dateEnd).getTime() + 24 * 60 * 60 * 1000
			txns = txns.filter((t) => new Date(t.createdAt).getTime() <= end)
		}

		txns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

		const total = txns.length
		const page = filters.page ?? 1
		const limit = filters.limit ?? 10
		const totalPages = Math.ceil(total / limit) || 1
		const startIndex = (page - 1) * limit
		const paginated = txns.slice(startIndex, startIndex + limit)

		const items = paginated.map((txn) => ({
			id: txn.id,
			code: txn.code,
			name: txn.name === "Purchase" ? "Jual Beli" : txn.name,
			type: txn.type,
			typeLabel: this.mapTypeLabel(txn.type, txn.name),
			amount: txn.amount,
			status: txn.status,
			statusLabel: this.mapStatusLabel(txn.status),
			paymentMethod: txn.paymentMethod,
			paymentDate: txn.paymentDate ? txn.paymentDate.toISOString() : null,
			createdAt: txn.createdAt.toISOString(),
		}))

		return {
			data: items,
			meta: {
				page,
				limit,
				total,
				totalPages,
			},
		}
	}

	async getPurchaseDetail(transactionId: number, ewalletId: number) {
		const detail = await this.ewalletTransactionDetailRepository.findOneBy({
			ewalletId: String(ewalletId),
			ewalletTransactionId: String(transactionId),
		})

		if (!detail) {
			throw new NotFoundException("Transaksi pembelian tidak ditemukan.")
		}

		const txn = await this.ewalletTransactionRepository.findOneBy({ id: transactionId })
		if (!txn) {
			throw new NotFoundException("Transaksi tidak ditemukan.")
		}

		const items = await this.ewalletTransactionItemRepository.findBy({
			ewalletTransactionId: String(txn.id),
		})

		const attachmentUrl = txn.paymentAttachment
			? this.storageService.getUrl(txn.paymentAttachment)
			: null

		return {
			id: txn.id,
			code: txn.code,
			name: txn.name === "Purchase" ? "Jual Beli" : txn.name,
			type: txn.type,
			typeLabel: this.mapTypeLabel(txn.type, txn.name),
			amount: txn.amount,
			status: txn.status,
			statusLabel: this.mapStatusLabel(txn.status),
			paymentMethod: txn.paymentMethod,
			paymentAccount: txn.paymentAccount,
			paymentOnBehalfOf: txn.paymentOnBehalfOf,
			paymentAttachment: attachmentUrl,
			paymentDate: txn.paymentDate ? txn.paymentDate.toISOString() : null,
			transferNewsNumber: txn.transferNewsNumber,
			paymentNote: txn.paymentNote,
			invalidNote: txn.invalidNote,
			createdAt: txn.createdAt.toISOString(),
			items: items.map((item) => ({
				id: item.id,
				description: item.description ?? "-",
				price: item.price ?? 0,
			})),
		}
	}
}
