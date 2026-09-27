import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common"
import { DataSource } from "typeorm"
import type { CreateTransactionResult, InvoiceSelectionResult } from "@roja/types"

import { calculateInvoiceTotals, toId } from "@shared/billing/invoice-calculator"
import type {
	CreateTransactionInput,
	InvoiceSelectionInput,
	UpdateTransactionNoteInput,
} from "@admin/payments/dto/payment-admin.dto"
import { StorageService } from "@core/storage/storage.service"
import { renderPrintReceipt } from "@admin/payments/payment-print"
import {
	ARREARS,
	CANCEL_SUCCESS,
	NOT_FOUND,
	SELECTION_FAILED,
	STALE_SELECTION,
	STORE_SUCCESS,
	UNDER_TOTAL,
	UPDATE_SUCCESS,
	ZERO_AMOUNT,
	toInvoiceRow,
	unique,
	unmaskRupiah,
	validTransactionIds,
	type InvoiceSqlRow,
	type LinkSqlRow,
	type Message,
	type TransactionSqlRow,
} from "@admin/payments/payment-format"
import { RECEIPT_CONTENT_TYPE, receiptFileName } from "@admin/payments/payment-receipt-pdf"
import { loadReceiptData, PaymentReceiptStore } from "@admin/payments/payment-receipt-store"
import { insertLink, insertTransaction, resetInvoice } from "@admin/payments/payment-write"
import * as sql from "@admin/payments/payment-sql"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"

// Legacy `StudentInvoiceController` — the write half: validating an invoice selection
// (@getDataInvoice 467-499), pricing the payment form (@createTransaction 508-538), recording
// the payment (@storeTransaction 546-616), cancelling it (@cancelTransaction 682-741), the note
// (@updateTransaction 655-673) and the receipt (@downloadTransaction 822-845).
//
// Every legacy message is reproduced verbatim; only the HTTP status changes, from 500 to 422,
// because these are business-rule rejections and not server faults (fix F-10).

@Injectable()
export class PaymentAdminService {
	private readonly receiptStore: PaymentReceiptStore

	constructor(
		private readonly dataSource: DataSource,
		storageService: StorageService,
	) {
		this.receiptStore = new PaymentReceiptStore(storageService)
	}

	/**
	 * `getDataInvoice` + `createTransaction`. Legacy split these across a POST that wrote a
	 * session key and a GET that read it back; fix F-5 collapses them into one call whose input
	 * is the selection itself, so nothing about the payment depends on server-side session state.
	 */
	async prepare(dto: InvoiceSelectionInput): Promise<InvoiceSelectionResult> {
		const ids = unique(dto.invoiceIds)
		const rows = await this.dataSource.query<InvoiceSqlRow[]>(sql.SELECT_INVOICES_SQL, [ids])
		this.assertSelection(rows, dto.studentGradeId, ids)

		const links = await this.dataSource.query<LinkSqlRow[]>(sql.SELECT_INVOICE_LINKS_SQL, [ids])
		const billed = this.priceSelection(rows, links)

		const items = rows.map((row) => ({
			invoiceId: Number(row.id),
			name: row.name,
			dueDate: row.dueDate,
			amount: billed.get(Number(row.id)) ?? 0,
		}))

		return {
			studentGradeId: dto.studentGradeId,
			items,
			total: items.reduce((total, item) => total + item.amount, 0),
		}
	}

	/**
	 * `storeTransaction`. One database transaction around the insert and the 2N follow-up
	 * statements (fix F-7), with the invoices locked `FOR UPDATE` before anything is priced, so
	 * the balances the payment is written against cannot move underneath it.
	 */
	async create(dto: CreateTransactionInput): Promise<CreateTransactionResult> {
		const ids = unique(dto.invoiceIds)
		const paid = unmaskRupiah(dto.amount)

		const result = await this.dataSource.transaction(async (manager) => {
			const rows = await manager.query<InvoiceSqlRow[]>(sql.SELECT_INVOICES_FOR_UPDATE_SQL, [ids])
			this.assertSelection(rows, dto.studentGradeId, ids)

			const links = await manager.query<LinkSqlRow[]>(sql.SELECT_INVOICE_LINKS_SQL, [ids])
			const billed = this.priceSelection(rows, links)

			// Fix F-8: no invoice is ever settled by a zero-rupiah line. Anything already covered
			// is a selection made against a page that is out of date, not a payment.
			if ([...billed.values()].some((amount) => amount <= 0)) {
				throw new UnprocessableEntityException(STALE_SELECTION)
			}
			const totalAmount = [...billed.values()].reduce((total, amount) => total + amount, 0)

			// The three guards in `storeTransaction`'s order, because the first match wins and
			// reordering them changes which message a request gets.
			if (paid < totalAmount && ids.length > 1) throw new UnprocessableEntityException(UNDER_TOTAL)
			// Fix F-3: legacy wrote `intval(str_replace(".", "", $request->amount === 0))`, which
			// hands `str_replace` a boolean, replaces nothing, and makes `intval("")` → 0 → falsy
			// every time. The guard never fired, so Rp 0 was accepted and pinned the invoice to
			// `installment` with no money against it. Parse first, then compare — and reject a
			// negative too, which the same dead guard also let through.
			if (paid <= 0) throw new UnprocessableEntityException(ZERO_AMOUNT)

			const installment = paid < totalAmount && ids.length === 1
			const transactionId = await insertTransaction(manager, {
				studentGradeId: dto.studentGradeId,
				amount: installment ? paid : totalAmount,
				desc: dto.desc,
				note: dto.note ?? null,
			})

			for (const row of rows) {
				const invoiceId = Number(row.id)
				const amount = billed.get(invoiceId) ?? 0

				if (installment) {
					// Partial payment of a single invoice: it stays `unpaid`, and only the method moves.
					await manager.update(StudentInvoice, { id: invoiceId }, { paymentMethod: "installment" })
					await insertLink(manager, { transactionId, invoiceId, amount, pay: paid })
					continue
				}

				// An invoice already being paid off in instalments keeps `installment` when the last
				// instalment closes it — the santri portal reads that value, so it must not become `cash`.
				if (row.paymentMethod === "installment") {
					await manager.update(StudentInvoice, { id: invoiceId }, { status: "paid" })
				} else {
					await manager.update(StudentInvoice, { id: invoiceId }, { status: "paid", paymentMethod: "cash" })
				}
				await insertLink(manager, { transactionId, invoiceId, amount, pay: amount })
			}

			return {
				message: STORE_SUCCESS,
				transactionId,
				// Legacy redirected to `detailTransaction` with `?download=yes`, which the page turns
				// into an automatic receipt download 700 ms later.
				redirect: `/student-invoices/transactions/${transactionId}?download=yes`,
			}
		})

		// Past the commit, so the money is on record whatever happens next. The receipt is generated
		// eagerly, because the page this redirects to downloads it 700ms later — but outside the
		// transaction and without being awaited. S3 being unreachable must never undo a payment, and
		// a receipt that fails to upload is one the download path renders instead.
		this.receiptStore.generateInBackground(result.transactionId, () =>
			loadReceiptData(this.dataSource, result.transactionId),
		)

		return result
	}

	/**
	 * `cancelTransaction`. The transaction flips to `invalid` and every invoice it touched is
	 * recomputed; no pivot row is ever deleted, so the money trail survives the cancellation.
	 */
	async cancel(transactionId: number, cancelNote: string): Promise<Message> {
		return this.dataSource.transaction(async (manager) => {
			const [transaction] = await manager.query<TransactionSqlRow[]>(
				sql.SELECT_TRANSACTION_FOR_UPDATE_SQL,
				[transactionId],
			)
			if (!transaction) throw new NotFoundException(NOT_FOUND)

			const pivots = await manager.find(StudentInvoiceTransaction, {
				select: { id: true, studentInvoiceId: true },
				where: { studentTransactionId: transactionId },
				order: { id: "ASC" },
			})
			const ids = unique(
				pivots.map((pivot) => toId(pivot.studentInvoiceId)).filter((id): id is number => id !== null),
			)
			// Locked before the flip and in id order, same as `create`, so the two never deadlock.
			const invoices =
				ids.length > 0
					? await manager.query<InvoiceSqlRow[]>(sql.SELECT_INVOICES_FOR_UPDATE_SQL, [ids])
					: []

			await manager.update(StudentTransaction, { id: transactionId }, { status: "invalid", cancelNote })

			// Read after the flip: this transaction's own links now report `invalid` and drop out.
			const links =
				ids.length > 0
					? await manager.query<LinkSqlRow[]>(sql.SELECT_INVOICE_LINKS_SQL, [ids])
					: []
			const valid = validTransactionIds(links)

			for (const invoice of invoices) {
				await resetInvoice(manager, invoice, links, valid)
			}

			return { message: CANCEL_SUCCESS }
		})
	}

	/** `updateTransaction`: the note always, the cancellation reason only while already `invalid`. */
	async updateNote(transactionId: number, dto: UpdateTransactionNoteInput): Promise<Message> {
		return this.dataSource.transaction(async (manager) => {
			const [transaction] = await manager.query<TransactionSqlRow[]>(
				sql.SELECT_TRANSACTION_FOR_UPDATE_SQL,
				[transactionId],
			)
			if (!transaction) throw new NotFoundException(NOT_FOUND)

			await manager.update(StudentTransaction, { id: transactionId }, { note: dto.note ?? null })
			if (transaction.status === "invalid" && dto.cancelNote !== undefined) {
				await manager.update(StudentTransaction, { id: transactionId }, { cancelNote: dto.cancelNote ?? null })
			}

			return { message: UPDATE_SUCCESS }
		})
	}

	/**
	 * `downloadTransaction`: the A5-landscape receipt as a PDF, priced from `pivot.pay`.
	 *
	 * The row read happens first and unconditionally, because a transaction that does not exist is
	 * a 404 rather than a bucket lookup, and because the filename is the santri's name.
	 */
	async receipt(transactionId: number): Promise<{ body: Buffer; fileName: string; contentType: string }> {
		const data = await loadReceiptData(this.dataSource, transactionId)
		return {
			body: await this.receiptStore.receipt(transactionId, data),
			fileName: receiptFileName(data.transaction.fullname),
			contentType: RECEIPT_CONTENT_TYPE,
		}
	}

	/** `printTransaction` (750-770): the same figures as the receipt, in the printable layout. */
	async print(transactionId: number): Promise<{ body: string; contentType: string }> {
		return renderPrintReceipt(await loadReceiptData(this.dataSource, transactionId))
	}

	/**
	 * `getDataInvoice`'s checks, plus the ownership check legacy never had.
	 *
	 * Legacy's arrears loop collects `due_date > now()` for every selected id, then walks the ids
	 * again: when the collected flags are unanimous every id is accepted, and when they are not
	 * the first overdue id returns the error. A not-yet-due id reached first in a mixed selection
	 * matches none of the three branches and is silently dropped — but a mixed selection always
	 * contains an overdue id, so the loop always reaches the error. Mixed means rejected, which
	 * is what this expresses directly.
	 */
	private assertSelection(rows: InvoiceSqlRow[], studentGradeId: number, ids: number[]): void {
		// Fix F-5. An id that does not exist, or belongs to another santri, is the tab-crossing
		// bug arriving as a request; legacy would have paid it against whoever the URL named.
		if (rows.length !== ids.length) throw new UnprocessableEntityException(SELECTION_FAILED)
		for (const row of rows) {
			if (toId(row.studentGradeId) !== studentGradeId) {
				throw new UnprocessableEntityException(SELECTION_FAILED)
			}
		}

		// Legacy renders a checkbox only for `status = 'unpaid'` (`StudentInvoiceService::getCheckBox`),
		// so anything else in the payload is a stale page or a hand-made request.
		if (rows.some((row) => row.status !== "unpaid")) {
			throw new UnprocessableEntityException(STALE_SELECTION)
		}

		if (new Set(rows.map((row) => row.notYetDue)).size > 1) {
			throw new UnprocessableEntityException(ARREARS)
		}
	}

	/**
	 * What each selected invoice is billed for, keyed by invoice id (fix F-8 — legacy keyed this
	 * by array position).
	 *
	 * Legacy computed `amount - sum(pay)` for an invoice already on instalments and the bare
	 * `amount` otherwise, resetting its accumulator inside the loop. `invoice-calculator` answers
	 * the same question for both cases and is the one implementation the santri portal shares, so
	 * an admin and a parent never see different balances.
	 */
	private priceSelection(rows: InvoiceSqlRow[], links: LinkSqlRow[]): Map<number, number> {
		const valid = validTransactionIds(links)
		const billed = new Map<number, number>()
		for (const row of rows) {
			billed.set(Number(row.id), calculateInvoiceTotals(toInvoiceRow(row), links, valid).remaining)
		}
		return billed
	}
}
