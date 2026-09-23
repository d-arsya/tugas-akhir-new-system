import type { InvoiceStatusLabel, InvoiceStudentCard } from "@roja/types"

import { toId, type InvoiceLinkRow, type InvoiceRow } from "@shared/billing/invoice-calculator"

// Row shapes and presentation rules for the Tagihan Santri read half, kept beside the SQL the
// same way `report-format.ts` and `student-cost-format.ts` sit beside theirs. Money and id columns
// are `bigint`, which node-postgres returns as strings, so nothing here assumes a number.

export type CardSqlRow = Omit<InvoiceStudentCard, "studentGradeId" | "studentId" | "photoUrl"> & {
	studentGradeId: string
	studentId: string | null
	photoPath: string | null
}

export type InvoiceSqlRow = {
	id: string
	amount: string | null
	status: "paid" | "unpaid" | null
	paymentMethod: "cash" | "installment" | null
}

export type LinkSqlRow = {
	studentInvoiceId: string | null
	studentTransactionId: string | null
	pay: string | null
	amount: string | null
	status: "valid" | "invalid" | null
}

export type BillSqlRow = InvoiceSqlRow & {
	name: string | null
	dueDate: string | null
	dueDateTs: string | null
	pastDue: boolean
}

export type BillDetailSqlRow = InvoiceSqlRow & {
	name: string | null
	note: string | null
	studentGradeId: string | null
	dueDate: string | null
	createdAt: string | null
}

export type TransactionSqlRow = {
	id: string
	transactionCode: string | null
	paidAt: string | null
	paidAtTs: string | null
	amount: string | null
	itemCount: number
	description: string | null
	cancelNote: string | null
}

/** A link row counts toward an invoice only while its transaction is still `valid`. */
export const validTransactionIds = (links: readonly LinkSqlRow[]): Set<number> => {
	const ids = new Set<number>()
	for (const link of links) {
		if (link.status !== "valid") continue
		const id = toId(link.studentTransactionId)
		if (id !== null) ids.add(id)
	}
	return ids
}

export const toInvoiceRow = (row: InvoiceSqlRow): InvoiceRow => ({
	id: row.id,
	amount: row.amount,
	status: row.status,
	paymentMethod: row.paymentMethod,
})

export const toLinkRow = (row: LinkSqlRow): InvoiceLinkRow => ({
	studentInvoiceId: row.studentInvoiceId,
	studentTransactionId: row.studentTransactionId,
	pay: row.pay,
	amount: row.amount,
})

/**
 * `addColumn('status')`, verbatim. PHP binds `&&` tighter than `||`, so the middle branch reads
 * `($status === 'paid' && $method === 'installment') || $method === 'cash'` — which is why an
 * *unpaid* cash invoice would be labelled "Dibayar" (no live row is in that state). A paid invoice
 * with no method matches no branch at all and legacy renders an empty cell — 49 live rows — hence
 * the null.
 */
export const statusLabel = (status: string | null, method: string | null): InvoiceStatusLabel | null => {
	if (status === "unpaid" && method === null) return "Belum Dibayar"
	if ((status === "paid" && method === "installment") || method === "cash") return "Dibayar"
	if (status === "unpaid" && method === "installment") return "Diangsur"
	return null
}

/**
 * The title and the badge beside it on `detail-bill.blade.php`.
 *
 * Legacy tests `strpos($name, 'Bulan') == true`, so a name *starting* with "Bulan" falls to the
 * else branch; no live name does. In that else branch legacy calls
 * `substr($name, strpos($name, 'ke'))` and `strpos` returns `false`, which PHP 8 coerces to 0 — so
 * every invoice without a "ke" printed its whole name twice, as both title and badge. The contract
 * keeps the title and drops the badge.
 */
export const splitInvoiceName = (name: string | null): { title: string; periodBadge: string } => {
	const raw = name ?? ""
	const bulanAt = raw.indexOf("Bulan")
	if (bulanAt > 0) {
		return { title: raw.split(" Bulan")[0] ?? raw, periodBadge: raw.slice(bulanAt + "Bulan".length).trim() }
	}
	const keAt = raw.indexOf("ke")
	return { title: raw.split(" ke")[0] ?? raw, periodBadge: keAt >= 0 ? raw.slice(keAt) : "" }
}
