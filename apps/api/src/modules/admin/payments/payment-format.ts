// Shared row shapes and formatting helpers for the payment write half.
//
// Split out of `payment-admin.service.ts` so both stay under the 300-line limit, and so the two
// receipt documents (`payment-receipt-pdf.ts` for the download, `payment-print.ts` for the
// printable page) read the same helpers rather than a copy each.

import { toId, type InvoiceLinkRow, type InvoiceRow } from "@shared/billing/invoice-calculator"
import { MONTHS_ID } from "@admin/common/date-format"

export type ReceiptTransaction = {
	transactionCode: string | null
	paidAt: Date | string | null
	amount: string | number | null
	desc: string | null
	fullname: string | null
	grade: string | null
	subGrade: string | null
	nis: string | null
}

export type ReceiptItem = { invoiceId: string | null; pay: string | number | null; name: string | null }

export type ReceiptSchool = {
	name: string | null
	phone: string | null
	fullAddress: string | null
	districtName: string | null
	regencyName: string | null
	provinceName: string | null
}

export type ReceiptData = {
	transaction: ReceiptTransaction
	items: ReceiptItem[]
	school: ReceiptSchool | null
}

// Carbon `translatedFormat` under `config('app.locale') = 'id'`
const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

/** Blade `{{ }}` escapes with `htmlspecialchars($value, ENT_QUOTES, 'UTF-8', true)`. */
export const escapeHtml = (value: unknown): string =>
	String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")

export const toNumber = (value: string | number | null | undefined): number => {
	if (value === null || value === undefined) return 0
	const parsed = typeof value === "number" ? value : Number(value)
	return Number.isFinite(parsed) ? parsed : 0
}

/** `number_format($value, 0, ",", ".")` — the receipt prints the `Rp` in its own column. */
export const numberFormat = (value: number): string => {
	const whole = Math.trunc(Math.abs(value))
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
	return value < 0 ? `-${whole}` : whole
}

/** The receipt's timestamps are read back in the school's own timezone, as Laravel stored them. */
const jakartaParts = (value: Date | string | null): { day: number; date: number; month: number; year: number } | null => {
	if (value === null) return null
	const parsed = value instanceof Date ? value : new Date(value)
	if (Number.isNaN(parsed.getTime())) return null
	const shifted = new Date(parsed.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }))
	return {
		day: shifted.getDay(),
		date: shifted.getDate(),
		month: shifted.getMonth(),
		year: shifted.getFullYear(),
	}
}

/**
 * `formatDate($transaction->paid_at, 'l \,\ d F Y')`.
 *
 * The format string separates `l` from the escaped comma with a plain space, so Carbon prints
 * **"Rabu , 23 September 2026"** — a space before the comma. Verified against the legacy Carbon
 * build rather than assumed, and kept, because the brief keeps legacy typography verbatim.
 */
export const longDateId = (value: Date | string | null): string => {
	const parts = jakartaParts(value)
	if (!parts) return ""
	const date = String(parts.date).padStart(2, "0")
	return `${DAYS_ID[parts.day]} , ${date} ${MONTHS_ID[parts.month]} ${parts.year}`
}

/**
 * `SettingSchool::getSchoolInvoiceAddressAttribute()` (SettingSchool.php:38-46).
 *
 * `getDistrictInvoiceName` and `getProvinceInvoiceName` default their prefix to `""` and still
 * concatenate `$prefix . " " . $name`, so both segments carry a leading space; HTML collapses it,
 * and each helper returns `""` when the lookup misses.
 */
export const invoiceAddress = (school: ReceiptSchool | null): string => {
	if (!school) return ""
	const district = school.districtName ? ` ${school.districtName}` : ""
	const province = school.provinceName ? ` ${school.provinceName}` : ""
	return `${school.fullAddress ?? ""}, ${district}, ${school.regencyName ?? ""}, ${province}`
}

// --- Service-side rows, messages and money helpers -------------------------------------

/** `getDataInvoice:483` — the arrears rule, kept exactly as legacy words it. */
export const ARREARS =
	"Tunggakan tidak bisa dibayarkan satu transaksi dengan tagihan lain (tunggakan = tagihan melewati jatuh tempo)."
/** `storeTransaction:550`. The `<br>` is legacy's; the client splits on it rather than rendering HTML. */
export const UNDER_TOTAL =
	"Nominal yang diinputkan kurang dari total biaya tagihan. <br> Angsuran hanya diperuntukkan satu tagihan saja."
/** `storeTransaction:556` — the message whose guard was dead. */
export const ZERO_AMOUNT = "Nominal yang diinputkan tidak boleh bernilai 0."
/** `getDataInvoice:497` — legacy's catch-all for a selection it cannot honour. */
export const SELECTION_FAILED = "Gagal membuat transaksi"
export const STORE_SUCCESS = "Data berhasil disimpan ke dalam basis data."
export const CANCEL_SUCCESS = "Pembayaran berhasil dibatalkan."
export const UPDATE_SUCCESS = "Data berhasil diupdate."
export const NOT_FOUND = "Pembayaran tidak ditemukan."

/**
 * New copy — legacy has no equivalent because it never checked. Fix F-8: `$installment` was
 * appended only for unpaid invoices but read back by the position of `$invoices`, so an invoice
 * paid by someone else between opening the form and pressing Simpan shifted every later row and
 * posted `amounts[]=""` — closing a fully-billed invoice with a zero payment on record.
 */
export const STALE_SELECTION = "Tagihan yang dipilih sudah berubah statusnya. Silakan muat ulang halaman."

export type InvoiceSqlRow = {
	id: string
	name: string | null
	amount: string | null
	status: "paid" | "unpaid" | null
	paymentMethod: "cash" | "installment" | null
	studentGradeId: string | null
	dueDate: string | null
	notYetDue: boolean
}

export type LinkSqlRow = InvoiceLinkRow & { id: string; transactionStatus: "valid" | "invalid" | null }

export type Message = { message: string }

export const unique = (ids: readonly number[]): number[] => [...new Set(ids)].sort((a, b) => a - b)

/**
 * `intval(str_replace(".", "", $request->amount))`, which strips autoNumeric's thousands dots
 * and then truncates at the first non-digit — so "1.500.000,75" is 1500000, not NaN. Mirrors
 * `unmaskRupiah` in the admin app, kept as its own copy because the API cannot import from there.
 */
export const unmaskRupiah = (masked: string): number => {
	const leading = /^\s*-?\d+/.exec(masked.replace(/\./g, ""))
	return leading ? Number.parseInt(leading[0], 10) : 0
}

export const toInvoiceRow = (row: InvoiceSqlRow): InvoiceRow => ({
	id: row.id,
	amount: row.amount,
	status: row.status,
	paymentMethod: row.paymentMethod,
})

/** Transactions whose links still count. Cancellation is a status flip, never a delete. */
export const validTransactionIds = (links: readonly LinkSqlRow[]): Set<number> => {
	const ids = new Set<number>()
	for (const link of links) {
		if (link.transactionStatus !== "valid") continue
		const id = toId(link.studentTransactionId)
		if (id !== null) ids.add(id)
	}
	return ids
}
