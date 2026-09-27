import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "node:crypto"
import { DataSource, Repository } from "typeorm"

import type { EwalletMoneyResult, EwalletPendingWithdraw } from "@roja/types"

import type { Env } from "@core/config/env.validation"
import { MailerService } from "@core/mailer/mailer.service"
import { RedisService } from "@core/redis/redis.service"
import { computeBalance, lockWallet, syncBalance } from "@shared/ewallet/balance"
import { pinMatches, pinToStored } from "@shared/ewallet/pin"
import { generateTransactionCode } from "@shared/ewallet/transaction-code"
import { sendCashReceipts, takeResetEmailSlot } from "@admin/ewallet/ewallet-mail"
import { insertCashTransaction, loadMoneyWallet, loadOfficer, loadSchoolName, type MoneyWallet } from "@admin/ewallet/money-sql"
import {
	claimPendingWithdraw,
	clearPendingWithdraw,
	clearPinStrikes,
	LOCKED_PIN_MESSAGE,
	markWithdrawPinVerified,
	MAX_FREE_STRIKES,
	parkWithdraw,
	readPendingWithdraw,
	registerPinStrike,
	wrongPinMessage,
} from "@admin/ewallet/withdraw-session"
import { Ewallet } from "@ewallet/entities/ewallet.entity"

/** A refusal that must carry `redirect`; the controller writes it straight to the response. */
export type MoneyRefusal = { refused: true; message: string; redirect: string }
export type MoneyOutcome = { refused: false; body: EwalletMoneyResult } | MoneyRefusal

type Done = {
	wallet: MoneyWallet
	officer: { name: string; email: string | null }
	code: string
	row: { createdAt: Date }
	school: string | null
}

const detailUrl = (id: number): string => `/ewallets/${id}`
const SESSION_GONE = "Sesi penarikan telah berakhir. Silakan ulangi dari awal."

// Legacy Dompet: cash top-up, the three-step withdraw, PIN reset (workstream D-B).
@Injectable()
export class EwalletMoneyService {
	private readonly logger = new Logger(EwalletMoneyService.name)

	constructor(
		private readonly dataSource: DataSource,
		private readonly redis: RedisService,
		private readonly mailer: MailerService,
		private readonly config: ConfigService<Env, true>,
		@InjectRepository(Ewallet) private readonly wallets: Repository<Ewallet>,
	) {}

	private async requireWallet(id: number): Promise<MoneyWallet> {
		const wallet = await loadMoneyWallet(this.dataSource.manager, id)
		if (!wallet) throw new NotFoundException("Ewallet tidak ditemukan.")
		return wallet
	}

	// Legacy EwalletController@topUp
	async topUp(adminId: number, walletId: number, amount: number): Promise<EwalletMoneyResult> {
		const done = await this.dataSource.transaction(async (manager): Promise<Done> => {
			if (!(await lockWallet(manager, walletId))) throw new NotFoundException("Ewallet tidak ditemukan.")
			const wallet = await loadMoneyWallet(manager, walletId)
			if (!wallet) throw new NotFoundException("Ewallet tidak ditemukan.")
			if (!wallet.isActive) throw new UnprocessableEntityException("Ewallet tidak aktif.")
			if (!wallet.hasOwner) throw new UnprocessableEntityException("Isi saldo gagal dilakukan.")
			const officer = await loadOfficer(manager, adminId)
			if (!officer) throw new UnprocessableEntityException("Isi saldo gagal dilakukan.")

			const code = await generateTransactionCode(manager, "income")
			const row = await insertCashTransaction(manager, {
				walletId,
				code,
				name: "Isi saldo",
				amount,
				type: "income",
				officerName: officer.name,
			})
			await syncBalance(manager, walletId)
			const school = await loadSchoolName(manager)
			return { wallet, officer, code, row, school }
		})

		this.receipts("income", "Isi saldo", amount, done)
		return { message: "Isi saldo berhasil dilakukan.", redirect: detailUrl(walletId) }
	}

	// Legacy EwalletController@validatePinConfirm
	async parkWithdraw(adminId: number, walletId: number, amount: number): Promise<EwalletMoneyResult> {
		await this.requireWallet(walletId)
		await parkWithdraw(this.redis, adminId, walletId, amount)
		return { message: "Mengarahkan ke halaman masuk pin.", redirect: `/ewallets/${walletId}/withdraw-pin` }
	}

	async pendingWithdraw(adminId: number, walletId: number): Promise<EwalletPendingWithdraw | null> {
		await this.requireWallet(walletId)
		return readPendingWithdraw(this.redis, adminId, walletId)
	}

	// Legacy EwalletController@validatePin, with the strike counter on the server
	async verifyPin(adminId: number, walletId: number, pin: string): Promise<MoneyOutcome> {
		const wallet = await this.requireWallet(walletId)
		const pending = await readPendingWithdraw(this.redis, adminId, walletId)
		if (!pending) throw new UnprocessableEntityException(SESSION_GONE)

		if (pinMatches(wallet.pin, pin)) {
			await markWithdrawPinVerified(this.redis, adminId, walletId, pending)
			return { refused: false, body: { message: "Pin benar." } }
		}

		const before = await registerPinStrike(this.redis, adminId, walletId)
		if (before < MAX_FREE_STRIKES) throw new UnprocessableEntityException(wrongPinMessage(before))

		await this.wallets.update({ id: walletId }, { isActive: false })
		await clearPinStrikes(this.redis, adminId, walletId)
		await clearPendingWithdraw(this.redis, adminId, walletId)
		return { refused: true, message: LOCKED_PIN_MESSAGE, redirect: `/ewallets/${walletId}/blocked` }
	}

	// Legacy EwalletController@withdraw
	async withdraw(adminId: number, walletId: number): Promise<MoneyOutcome> {
		await this.requireWallet(walletId)
		const pending = await readPendingWithdraw(this.redis, adminId, walletId)
		if (!pending) throw new UnprocessableEntityException(SESSION_GONE)
		if (!pending.pinVerified) throw new UnprocessableEntityException("Pin belum diverifikasi.")
		// Exactly one request consumes the parked amount; a double-click finds nothing to claim.
		if (!(await claimPendingWithdraw(this.redis, adminId, walletId))) {
			throw new UnprocessableEntityException("Penarikan ini sudah diproses atau sesi telah berakhir.")
		}
		const amount = pending.amount

		const outcome = await this.dataSource.transaction(async (manager): Promise<Done | "insufficient"> => {
			if (!(await lockWallet(manager, walletId))) throw new NotFoundException("Ewallet tidak ditemukan.")
			const wallet = await loadMoneyWallet(manager, walletId)
			if (!wallet) throw new NotFoundException("Ewallet tidak ditemukan.")

			// Re-checked inside the lock: legacy read it outside, so parallel withdrawals could overdraw
			if ((await computeBalance(manager, walletId)) < amount) return "insufficient"

			if (!wallet.isActive && wallet.ownerType === "santri" && wallet.studentStatus !== "inactive") {
				throw new UnprocessableEntityException("Ewallet tidak aktif.")
			}
			if (!wallet.hasOwner) throw new UnprocessableEntityException("Tarik saldo gagal dilakukan.")
			const officer = await loadOfficer(manager, adminId)
			if (!officer) throw new UnprocessableEntityException("Tarik saldo gagal dilakukan.")

			const code = await generateTransactionCode(manager, "expense")
			const row = await insertCashTransaction(manager, {
				walletId,
				code,
				name: "Tarik saldo",
				amount,
				type: "expense",
				officerName: officer.name,
			})
			await syncBalance(manager, walletId)
			const school = await loadSchoolName(manager)
			return { wallet, officer, code, row, school }
		})

		if (outcome === "insufficient") {
			return { refused: true, message: "Saldo tidak mencukupi.", redirect: detailUrl(walletId) }
		}
		this.receipts("expense", "Tarik saldo", amount, outcome)
		return { refused: false, body: { message: "Tarik saldo berhasil dilakukan.", redirect: detailUrl(walletId) } }
	}

	// Legacy EwalletController@resetPin — does not touch is_active (the old placeholder forced it on)
	async resetPin(walletId: number, pin: string): Promise<EwalletMoneyResult> {
		await this.requireWallet(walletId)
		await this.wallets.update({ id: walletId }, { pin: pinToStored(pin) })
		return { message: "Pin berhasil direset." }
	}

	// Legacy EwalletController@sendEmailResetPin
	async sendResetPinEmail(walletId: number): Promise<MoneyOutcome> {
		const wallet = await this.requireWallet(walletId)
		const failed: MoneyRefusal = {
			refused: true,
			message: "Email reset pin gagal dikirim.",
			redirect: `/ewallets/${walletId}/setting`,
		}
		if (!wallet.ownerType || !wallet.hasOwner || !wallet.ownerEmail || !wallet.ownerId) return failed

		// Limiter first: a throttled request must not rotate the token behind the link already sent
		const slot = await takeResetEmailSlot(this.redis, wallet.ownerType, wallet.ownerId)
		if (!slot.allowed) return failed

		const token = crypto.randomBytes(5).toString("hex")
		const hashed = await bcrypt.hash(token, 10)
		await this.wallets.update(
			{ id: walletId },
			{ resetPinToken: hashed, resetPinExpired: () => "NOW() + interval '60 minutes'" },
		)

		// The same base and paths the portals' own reset emails use (`santri-ewallet.service.ts`, `merchant-ewallet.service.ts`),
		// so an emailed token lands where the portal's reset endpoint expects it. Legacy's `/e-wallet/pin/email/reset/…` is not routed
		const appUrl = (this.config.get("APP_URL", { infer: true }) ?? "").replace(/\/+$/, "")
		const resetPath = wallet.ownerType === "santri" ? "/e-wallet/pin/reset" : "/merchant/e-wallet/pin/reset"
		const school = (await loadSchoolName(this.dataSource.manager)) ?? "Pondok Roja"
		try {
			await this.mailer.sendEwalletResetPin(wallet.ownerEmail, {
				subject: `${school} - Reset Pin`,
				school,
				name: wallet.ownerName ?? "-",
				resetUrl: `${appUrl}${resetPath}/${token}`,
			})
		} catch (error) {
			this.logger.error(`reset pin email: ${error instanceof Error ? error.message : String(error)}`)
			return failed
		}
		return { refused: false, body: { message: "Email reset pin berhasil terkirim." } }
	}

	/** After commit, not awaited: a slow or dead mail service never delays or fails the cash request. */
	private receipts(type: "income" | "expense", transactionName: string, amount: number, done: Done): void {
		void sendCashReceipts(this.mailer, {
			type,
			code: done.code,
			transactionName,
			amount,
			createdAt: done.row.createdAt,
			officerName: done.officer.name,
			school: done.school,
			owner: { name: done.wallet.ownerName, email: done.wallet.ownerEmail },
			officer: done.officer,
		})
	}
}
