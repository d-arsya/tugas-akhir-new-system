/**
 * Single source of truth for "how much has been paid against an invoice".
 *
 * Both the admin Pembayaran Santri module and the santri-facing payment-history
 * API compute this, and legacy computed it three mutually-inconsistent ways
 * (`StudentInvoiceController` used SUM(pay) in SQL, a PHP loop over pivot rows,
 * and a loop over whole-transaction totals keyed by transaction id). Keeping one
 * implementation is what stops admin and the parent portal disagreeing about
 * whether a santri has paid.
 *
 * Money arrives from Postgres `bigint` columns, which node-postgres returns as
 * strings, so every numeric input is normalised through `toAmount` rather than
 * trusted to be a number.
 */

/** A payment link row (`tbr_student_invoice_transactions`). */
export type InvoiceLinkRow = {
	studentInvoiceId: number | string | null
	studentTransactionId: number | string | null
	/** What was actually paid toward this invoice. */
	pay: number | string | null
	/** Snapshot of the invoice amount when the payment was recorded. Differs from `pay` in 1,039 live rows. */
	amount: number | string | null
}

/** The invoice fields the calculation depends on (`tbr_student_invoices`). */
export type InvoiceRow = {
	id: number | string
	amount: number | string | null
	status: "paid" | "unpaid" | null
	paymentMethod: "cash" | "installment" | null
}

export type InvoiceStatusLabel = "Lunas" | "Cicilan" | "Belum Bayar"

export type InvoiceTotals = {
	amount: number
	paid: number
	remaining: number
	statusLabel: InvoiceStatusLabel
}

/** `bigint` columns arrive as strings; anything unparseable is 0. */
export const toAmount = (value: number | string | null | undefined): number => {
	if (value === null || value === undefined) return 0
	const parsed = typeof value === "number" ? value : Number(value)
	return Number.isFinite(parsed) ? parsed : 0
}

/** `bigint` ids arrive as strings; null and unparseable become null so they never match a real id. */
export const toId = (value: number | string | null | undefined): number | null => {
	if (value === null || value === undefined) return null
	const parsed = typeof value === "number" ? value : Number(value)
	return Number.isFinite(parsed) ? parsed : null
}

/**
 * Links that count toward an invoice: addressed to it, and belonging to a
 * transaction that is still `valid`. A cancelled transaction keeps its link row
 * — cancellation is a status flip, never a delete — so the validity check is
 * what excludes it.
 */
export const selectCountedLinks = (
	invoiceId: number | string,
	links: readonly InvoiceLinkRow[],
	validTransactionIds: ReadonlySet<number>,
): InvoiceLinkRow[] => {
	const target = toId(invoiceId)
	if (target === null) return []
	return links.filter((link) => {
		const linkInvoiceId = toId(link.studentInvoiceId)
		const linkTransactionId = toId(link.studentTransactionId)
		if (linkInvoiceId === null || linkTransactionId === null) return false
		if (linkInvoiceId !== target) return false
		return validTransactionIds.has(linkTransactionId)
	})
}

/**
 * Total paid against one invoice.
 *
 * `pay` is authoritative; `amount` is only a fallback for rows where `pay` was
 * never written. Legacy's own SQL (`report-sql.ts`) sums `pay` for the same reason.
 */
export const calculatePaid = (
	invoice: InvoiceRow,
	links: readonly InvoiceLinkRow[],
	validTransactionIds: ReadonlySet<number>,
): number => {
	const counted = selectCountedLinks(invoice.id, links, validTransactionIds)
	const summed = counted.reduce<number>(
		(total, link) => total + toAmount(link.pay ?? link.amount),
		0,
	)

	// A stored `paid` that the linked transactions do not add up to is trusted over
	// the sum. 9 live invoices are in that state: their capability was re-published,
	// the new invoice inherited `status='paid'`, and the payment stayed attached to
	// the superseded row. The money was received, so reporting it as owed would be wrong.
	const amount = toAmount(invoice.amount)
	if (invoice.status === "paid" && summed < amount) return amount

	return summed
}

export const resolveStatusLabel = (
	invoice: InvoiceRow,
	paid: number,
): InvoiceStatusLabel => {
	const amount = toAmount(invoice.amount)
	if (invoice.status === "paid" || paid >= amount) return "Lunas"
	if (paid > 0 || invoice.paymentMethod === "installment") return "Cicilan"
	return "Belum Bayar"
}

/** Everything the UI needs for a single invoice row. */
export const calculateInvoiceTotals = (
	invoice: InvoiceRow,
	links: readonly InvoiceLinkRow[],
	validTransactionIds: ReadonlySet<number>,
): InvoiceTotals => {
	const amount = toAmount(invoice.amount)
	const paid = calculatePaid(invoice, links, validTransactionIds)
	return {
		amount,
		paid,
		remaining: Math.max(0, amount - paid),
		statusLabel: resolveStatusLabel(invoice, paid),
	}
}

export type InvoiceSetTotals = {
	totalBilled: number
	totalPaid: number
	remaining: number
}

/** Aggregate across a set of invoices, summing the same per-invoice figures. */
export const calculateSetTotals = (
	invoices: readonly InvoiceRow[],
	links: readonly InvoiceLinkRow[],
	validTransactionIds: ReadonlySet<number>,
): InvoiceSetTotals => {
	let totalBilled = 0
	let totalPaid = 0
	for (const invoice of invoices) {
		totalBilled += toAmount(invoice.amount)
		totalPaid += calculatePaid(invoice, links, validTransactionIds)
	}
	return {
		totalBilled,
		totalPaid,
		remaining: Math.max(0, totalBilled - totalPaid),
	}
}
