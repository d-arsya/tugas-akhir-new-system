import type { EntityManager } from "typeorm"

import { calculatePaid, toAmount } from "@shared/billing/invoice-calculator"
import { toInvoiceRow, type InvoiceSqlRow, type LinkSqlRow } from "@admin/payments/payment-format"
import * as sql from "@admin/payments/payment-sql"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"

// The statement-level write primitives behind `storeTransaction` and `cancelTransaction`.
// Split out of `payment-admin.service.ts` to keep it under the 300-line limit; both take the
// caller's `EntityManager`, so they always run inside the caller's transaction and never open
// one of their own.

const databaseNow = (): string => "now()"

/**
 * Fix F-4. Legacy's two reset branches are `paid + installment + remain < amount` and
 * `(paid + cash + remain == amount) || (unpaid + installment + remain == amount)`. An
 * instalment invoice that had been closed by its final payment sits at `paid + installment`,
 * and cancelling that payment leaves `remain == amount` — which the first branch misses
 * because it needs `<`, and the second misses because it needs `cash` or `unpaid`. The invoice
 * stayed **Lunas with zero valid payments against it**, and the santri portal agreed.
 */
export const resetInvoice = async (
	manager: EntityManager,
	invoice: InvoiceSqlRow,
	links: LinkSqlRow[],
	valid: Set<number>,
): Promise<void> => {
	const id = Number(invoice.id)
	const amount = toAmount(invoice.amount)
	// `calculatePaid` trusts a stored `paid` over an under-summing link set — correct when
	// reading, wrong here, because whether the invoice is still settled is exactly the question
	// that stored flag has just lost the right to answer. Asking about an `unpaid` copy of the
	// row keeps the one shared implementation of the sum and skips only that trust branch.
	const settled = calculatePaid({ ...toInvoiceRow(invoice), status: "unpaid" }, links, valid)

	if (settled <= 0) {
		// Nothing valid left: back to a plain unpaid bill. `payment_method` must go to NULL and
		// not to `cash` — the santri portal treats `installment` as "being paid off".
		await manager.update(StudentInvoice, { id }, { status: "unpaid", paymentMethod: null })
		return
	}
	if (settled >= amount) {
		// Other valid payments still cover it, so it stays settled and keeps its method.
		await manager.update(StudentInvoice, { id }, { status: "paid" })
		return
	}
	await manager.update(StudentInvoice, { id }, { status: "unpaid", paymentMethod: "installment" })
}

/** `StudentTransaction::create()`, with the code generated under the day lock (fix F-9). */
export const insertTransaction = async (
	manager: EntityManager,
	values: { studentGradeId: number; amount: number; desc: string; note: string | null },
): Promise<number> => {
	// Both id sequences trail their table's MAX(id) in the live data, so an insert that draws
	// from them collides on the primary key — see the note in `payment-sql.ts`.
	await manager.query(sql.SYNC_TRANSACTION_SEQUENCE_SQL)
	await manager.query(sql.SYNC_LINK_SEQUENCE_SQL)

	const days = await manager.query<{ dayBase: string }[]>(sql.TRANSACTION_CODE_DAY_BASE_SQL)
	const dayBase = days[0]?.dayBase
	if (dayBase === undefined) throw new Error("Tidak dapat menentukan kode transaksi.")

	await manager.query(sql.LOCK_TRANSACTION_CODE_DAY_SQL, [dayBase])
	const codes = await manager.query<{ nextCode: string }[]>(sql.NEXT_TRANSACTION_CODE_SQL, [
		dayBase,
	])
	const nextCode = codes[0]?.nextCode
	if (nextCode === undefined) throw new Error("Tidak dapat menentukan kode transaksi.")

	const inserted = await manager.insert(StudentTransaction, {
		studentTransactionCode: nextCode,
		studentGradeId: String(values.studentGradeId),
		paidAt: databaseNow,
		amount: values.amount,
		desc: values.desc,
		note: values.note,
		status: "valid",
		createdAt: databaseNow,
		updatedAt: databaseNow,
	})
	const id: unknown = inserted.identifiers[0]?.id
	if (id === undefined) throw new Error("Data gagal disimpan ke dalam basis data")
	return Number(id)
}

export const insertLink = async (
	manager: EntityManager,
	values: { transactionId: number; invoiceId: number; amount: number; pay: number },
): Promise<void> => {
	await manager.insert(StudentInvoiceTransaction, {
		studentTransactionId: values.transactionId,
		studentInvoiceId: values.invoiceId,
		amount: values.amount,
		pay: values.pay,
		createdAt: databaseNow,
		updatedAt: databaseNow,
	})
}
