import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { StorageService } from "@core/storage/storage.service"
import { EwalletTransaction } from "@ewallet/entities/ewallet-transaction.entity"

@Injectable()
export class EwalletTopUpService {
	constructor(
		@InjectRepository(EwalletTransaction)
		private readonly ewalletTransactionRepository: Repository<EwalletTransaction>,
		private readonly storageService: StorageService,
	) {}

	async getTopUpBankInfo() {
		return {
			bankName: "BSI (Bank Syariah Indonesia)",
			accountNumber: "7192852646",
			accountName: "Tabungan Pondok ROJA",
			minAmount: 1000,
			note: "Transfer sesuai nominal lalu sertakan bukti transfer saat melakukan konfirmasi.",
		}
	}

	private async generateTransactionCode(type: string): Promise<string> {
		let prefix = "00"
		if (type === "income") prefix = "01"
		else if (type === "expense") prefix = "02"
		else if (type === "purchase") prefix = "03"

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

	async createTopUpBankTransfer(ewalletId: number, amount: number) {
		if (amount < 1000) {
			throw new BadRequestException("Nominal top-up minimal Rp 1.000")
		}

		const code = await this.generateTransactionCode("income")
		const transferNewsNumber = Math.floor(10 + Math.random() * 90)

		const txn = this.ewalletTransactionRepository.create({
			ewalletId: String(ewalletId),
			code,
			name: "Isi saldo",
			type: "income",
			amount: String(amount),
			status: "waiting",
			paymentMethod: "Bank Transfer (Manual)",
			paymentAccount: "BSI 7192852646",
			paymentOnBehalfOf: "Tabungan Pondok ROJA",
			transferNewsNumber,
		})

		await this.ewalletTransactionRepository.save(txn)

		return {
			transactionId: txn.id,
			code: txn.code,
			amount,
			transferNewsNumber,
			totalAmount: amount + transferNewsNumber,
			paymentAccount: "BSI 7192852646",
			paymentOnBehalfOf: "Tabungan Pondok ROJA",
			message:
				"Transaksi isi saldo berhasil dibuat. Silakan lakukan transfer bank lalu unggah bukti pembayaran.",
		}
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
}
