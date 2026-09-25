import { Logger } from "@nestjs/common"

import type { EwalletOwnerType } from "@roja/types"

import type { MailerService } from "@core/mailer/mailer.service"
import type { RedisService } from "@core/redis/redis.service"

const logger = new Logger("EwalletMail")

// --- Reset-pin email limiter (legacy `RateLimiter` key `send-message:{student.id}`, 6 per minute) ----
//
// Legacy's key used the *owner's* id for students and merchants alike, so santri 7 and merchant 7
// shared a budget; the key here carries the owner type. `EwalletSettingPage.resetEmailRetryAfter`
// (D-A) reads the remaining wait from `resetEmailRetryAfter` below — legacy kept it in a cookie.

const RESET_EMAIL_LIMIT = 6
const RESET_EMAIL_WINDOW_SECONDS = 60

const resetEmailKey = (ownerType: EwalletOwnerType, ownerId: string | number): string =>
	`ewallet:reset-pin-mail:${ownerType}:${ownerId}`

/**
 * Seconds until another reset email may be sent for this owner, or 0 while there is still budget.
 * The wait is only reported once the six sends of the window are used up.
 */
export const resetEmailRetryAfter = async (
	redis: RedisService,
	ownerType: EwalletOwnerType,
	ownerId: string | number,
): Promise<number> => {
	const key = resetEmailKey(ownerType, ownerId)
	const used = Number((await redis.get(key)) ?? 0)
	if (used < RESET_EMAIL_LIMIT) return 0
	return redis.ttlSeconds(key)
}

/**
 * Spends one of the six sends. Called **before** the token is rotated, so a throttled request
 * leaves the emailed link intact. Counting first (INCR) rather than read-then-write keeps two
 * parallel requests from both taking the sixth slot.
 */
export const takeResetEmailSlot = async (
	redis: RedisService,
	ownerType: EwalletOwnerType,
	ownerId: string | number,
): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> => {
	const key = resetEmailKey(ownerType, ownerId)
	const count = await redis.incrWithWindow(key, RESET_EMAIL_WINDOW_SECONDS)
	if (count <= RESET_EMAIL_LIMIT) return { allowed: true }
	return { allowed: false, retryAfter: await redis.ttlSeconds(key) }
}

// --- Receipts ---------------------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** `formatFromTo($created_at, …, 'd M Y \j\a\m H:i')` in Asia/Jakarta (Carbon's `M` is the English abbreviation). */
const receiptDate = (date: Date): string => {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Jakarta",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(date)
	const part = (type: string): string => parts.find((p) => p.type === type)?.value ?? ""
	return `${part("day")} ${MONTHS[Number(part("month")) - 1] ?? ""} ${part("year")} jam ${part("hour")}:${part("minute")}`
}

/** `rupiah()` from the legacy helpers: `Rp 1.500.000`. */
const rupiah = (amount: number): string => `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`

export type CashReceipt = {
	type: "income" | "expense"
	code: string
	transactionName: string
	amount: number
	createdAt: Date
	officerName: string
	school: string | null
	owner: { name: string | null; email: string | null }
	officer: { name: string; email: string | null }
}

const send = async (label: string, job: () => Promise<void>): Promise<void> => {
	try {
		await job()
	} catch (error) {
		logger.error(`${label}: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * The owner's and the officer's copy of the receipt. Legacy sent both with `notify()` inside the
 * database transaction and greeted the officer by the santri's name; the officer's copy here
 * greets the officer. Never throws: the money has already moved.
 */
export const sendCashReceipts = async (mailer: MailerService, receipt: CashReceipt): Promise<void> => {
	const title = receipt.type === "income" ? "Isi Saldo" : "Tarik Saldo"
	const school = receipt.school ?? "Pondok Roja"
	const base = {
		subject: `${school} - Notifikasi ${title}`,
		school,
		title,
		totalAmount: rupiah(receipt.amount),
		paymentMethod: "Cash",
		onBehalfLabel: receipt.type === "income" ? "Nama penerima" : "Nama Kasir E-Wallet",
		onBehalfOf: receipt.officerName || "-",
		code: receipt.code,
		transactionName: receipt.transactionName,
		date: receiptDate(receipt.createdAt),
	}

	const jobs: Array<Promise<void>> = []
	if (receipt.owner.email) {
		const to = receipt.owner.email
		jobs.push(send(`owner receipt ${receipt.code}`, () => mailer.sendEwalletTransaction(to, { ...base, recipient: receipt.owner.name ?? "-" })))
	}
	if (receipt.officer.email) {
		const to = receipt.officer.email
		jobs.push(send(`officer receipt ${receipt.code}`, () => mailer.sendEwalletTransaction(to, { ...base, recipient: receipt.officer.name })))
	}
	await Promise.all(jobs)
}
