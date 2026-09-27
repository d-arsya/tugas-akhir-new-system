import { Injectable, NotFoundException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, IsNull, Not, Repository } from "typeorm"
import type {
	InvoiceBillDetail,
	InvoiceBillRow,
	InvoiceDetailPage,
	InvoiceStudentCard,
	InvoiceTransactionRow,
	ServerTableResult,
	StudentInvoiceListRow,
} from "@roja/types"

import type { Env } from "@core/config/env.validation"
import { calculateInvoiceTotals, calculatePaid, calculateSetTotals, toAmount } from "@shared/billing/invoice-calculator"
import type { InvoiceBillInput, StudentInvoiceListInput, UpdateInvoiceNoteInput } from "@admin/payments/dto/invoice-admin.dto"
import {
	splitInvoiceName,
	statusLabel,
	toInvoiceRow,
	toLinkRow,
	validTransactionIds,
	type BillDetailSqlRow,
	type BillSqlRow,
	type TransactionSqlRow,
} from "@admin/payments/invoice-format"
import { SqlParams } from "@admin/common/sql"
import { Accountancy } from "@admin/common/entities/accountancy.entity"
import { findBillLinks, findStudentCardRow } from "@admin/payments/invoice-queries"
import * as sql from "@admin/payments/invoice-sql"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"

const UPDATE_SUCCESS = "Data berhasil diupdate."

/**
 * Port of the legacy `StudentInvoiceController` read half: the santri picker, one santri's
 * three-tab detail page, and a single invoice. Owned by WS P1-A.
 *
 * Every "how much has been paid" figure comes from `@shared/billing/invoice-calculator`; SQL only
 * mirrors it (`PAID_EXPR`) so that ordering and paging agree with the numbers the calculator
 * produces for the page.
 */
@Injectable()
export class InvoiceAdminService {
	constructor(
		private readonly dataSource: DataSource,
		private readonly configService: ConfigService<Env, true>,
		@InjectRepository(StudentInvoice) private readonly invoices: Repository<StudentInvoice>,
		@InjectRepository(Accountancy) private readonly accountancies: Repository<Accountancy>,
	) {}

	/** `@studentListServerSide` — `leftjoin` throughout, so a santri with no invoices still lists at 0. */
	async findStudents(query: StudentInvoiceListInput): Promise<ServerTableResult<StudentInvoiceListRow>> {
		const params = new SqlParams()
		const where = sql.studentWhere(query, params)
		const limit = params.add(query.limit)
		const offset = params.add((query.page - 1) * query.limit)

		const [totals, filtered, rows] = await Promise.all([
			this.dataSource.query<{ total: number }[]>(sql.STUDENT_TOTAL_SQL),
			this.dataSource.query<{ total: number }[]>(sql.studentCountSql(where), params.values.slice(0, -2)),
			this.dataSource.query<(Omit<StudentInvoiceListRow, "studentGradeId" | "studentId"> & { studentGradeId: string; studentId: string | null })[]>(
				sql.studentRowsSql(where, sql.studentOrderBy(query), limit, offset),
				params.values,
			),
		])

		return {
			rows: rows.map((row) => ({
				...row,
				studentGradeId: Number(row.studentGradeId),
				studentId: Number(row.studentId ?? 0),
			})),
			recordsTotal: totals[0]?.total ?? 0,
			recordsFiltered: filtered[0]?.total ?? 0,
		}
	}

	/** `@edit` — the student card, the three widgets, and the `#cost` dropdown. */
	async findStudentDetail(studentGradeId: number): Promise<InvoiceDetailPage> {
		const student = await this.findStudentCard(studentGradeId)

		const invoices = await this.invoices.find({
			select: { id: true, amount: true, status: true, paymentMethod: true },
			where: { studentGradeId: String(studentGradeId), validityStatus: true },
			order: { id: "ASC" },
		})
		const links = await findBillLinks(this.dataSource, invoices.map((invoice) => Number(invoice.id)))
		const costOptions = await this.accountancies.find({
			select: { id: true, name: true },
			where: { parentId: Not(IsNull()), isStudentCost: true },
			order: { id: "ASC" },
		})

		// Legacy summed whole-transaction `amount` keyed by transaction id — its third and loosest
		// reading of "paid". `calculateSetTotals` sums the pivot `pay` of valid transactions instead.
		const totals = calculateSetTotals(invoices, links.map(toLinkRow), validTransactionIds(links))

		return {
			student,
			summary: {
				// `$total >= 0 ? $total : 0` — the calculator floors `remaining` the same way
				totalUnpaid: totals.remaining,
				unpaidItemCount: invoices.filter((invoice) => invoice.status === "unpaid").length,
				installmentItemCount: invoices.filter(
					(invoice) => invoice.status === "unpaid" && invoice.paymentMethod === "installment",
				).length,
			},
			costOptions: costOptions.map((option) => ({ id: Number(option.id), name: option.name })),
		}
	}

	/** `@listBillServerSide` — the Tagihan tab. */
	async findBills(studentGradeId: number, query: InvoiceBillInput): Promise<ServerTableResult<InvoiceBillRow>> {
		const params = new SqlParams()
		const where = sql.billWhere(studentGradeId, query, params)
		const limit = params.add(query.limit)
		const offset = params.add((query.page - 1) * query.limit)

		const [recordsTotal, filtered, rows] = await Promise.all([
			this.invoices.countBy({ studentGradeId: String(studentGradeId), validityStatus: true }),
			this.dataSource.query<{ total: number }[]>(sql.billCountSql(where), params.values.slice(0, -2)),
			this.dataSource.query<BillSqlRow[]>(
				sql.billRowsSql(where, sql.billOrderBy(query), limit, offset),
				params.values,
			),
		])

		const links = await findBillLinks(this.dataSource, rows.map((row) => Number(row.id)))
		const valid = validTransactionIds(links)
		const linkRows = links.map(toLinkRow)

		return {
			rows: rows.map((row) => {
				const totalsForRow = calculateInvoiceTotals(toInvoiceRow(row), linkRows, valid)
				const label = statusLabel(row.status, row.paymentMethod)
				return {
					id: Number(row.id),
					name: row.name,
					amount: totalsForRow.amount,
					paid: totalsForRow.paid,
					// Legacy prints `biaya - dibayar`, which goes negative when a payment overshot;
					// `remaining` is floored at 0, so the subtraction is done here instead.
					balance: totalsForRow.amount - totalsForRow.paid,
					status: row.status,
					paymentMethod: row.paymentMethod,
					statusLabel: label,
					dueDate: row.dueDate,
					dueDateTs: row.dueDateTs === null ? null : Number(row.dueDateTs),
					// `datatableRowCallback`: painted when the due date has passed and the label is
					// not "Dibayar". Computed here rather than scraped back out of the cell HTML.
					isOverdue: row.pastDue && label !== "Dibayar",
					// `addColumn('checkBox')`: its two branches collapse to `status === 'unpaid'`
					selectable: row.status === "unpaid",
				}
			}),
			recordsTotal,
			recordsFiltered: filtered[0]?.total ?? 0,
		}
	}

	/** `@listTransaction` — Riwayat Pembayaran. Client-side paged, so the whole set is returned. */
	async findPayments(studentGradeId: number): Promise<InvoiceTransactionRow[]> {
		return this.findTransactions(studentGradeId, "valid")
	}

	/** `@listCancel` — Dibatalkan, the same list with `cancel_note` attached. */
	async findCancelled(studentGradeId: number): Promise<InvoiceTransactionRow[]> {
		return this.findTransactions(studentGradeId, "invalid")
	}

	/** `@detailBill` — one invoice and the valid payments against it. */
	async findBill(invoiceId: number): Promise<InvoiceBillDetail> {
		const [invoice] = await this.dataSource.query<BillDetailSqlRow[]>(sql.INVOICE_SQL, [invoiceId])
		if (!invoice) throw new NotFoundException("Tagihan tidak ditemukan")

		const student = await this.findStudentCard(Number(invoice.studentGradeId ?? 0))

		const transactions = await this.dataSource.query<
			{ id: string; transactionCode: string | null; note: string | null; paidAt: string | null; pay: string | null }[]
		>(sql.INVOICE_TRANSACTIONS_SQL, [invoiceId])
		const links = await findBillLinks(this.dataSource, [invoiceId])

		const amount = toAmount(invoice.amount)
		const totalPaid = calculatePaid(toInvoiceRow(invoice), links.map(toLinkRow), validTransactionIds(links))
		const { title, periodBadge } = splitInvoiceName(invoice.name)

		return {
			id: Number(invoice.id),
			name: invoice.name,
			title,
			periodBadge,
			amount,
			dueDate: invoice.dueDate,
			createdAt: invoice.createdAt,
			note: invoice.note,
			student,
			transactions: transactions.map((transaction) => ({
				id: Number(transaction.id),
				transactionCode: transaction.transactionCode,
				note: transaction.note,
				paidAt: transaction.paidAt,
				pay: toAmount(transaction.pay),
			})),
			totalPaid,
			// Legacy seeds `$cost_remain = 0` and only fills it inside the pivot loop, so an invoice
			// with no payments at all reported "Sisa yang harus dibayar Rp 0". Seeded from `amount`.
			costRemain: amount - totalPaid,
		}
	}

	/** `@update` — the only write in the read half: the free-text note under the invoice. */
	async updateBillNote(invoiceId: number, body: UpdateInvoiceNoteInput): Promise<{ message: string }> {
		const exists = await this.invoices.existsBy({ id: invoiceId })
		if (!exists) throw new NotFoundException("Tagihan tidak ditemukan")

		await this.invoices.update({ id: invoiceId }, { note: body.note })
		return { message: UPDATE_SUCCESS }
	}

	// ─── internals ───────────────────────────────────────────────

	private async findStudentCard(studentGradeId: number): Promise<InvoiceStudentCard> {
		const row = await findStudentCardRow(this.dataSource, studentGradeId)
		// Legacy binds `StudentGrade` through the router, so a missing or soft-deleted grade 404s
		if (!row) throw new NotFoundException("Santri tidak ditemukan")

		return {
			studentGradeId: Number(row.studentGradeId),
			studentId: Number(row.studentId ?? 0),
			nis: row.nis,
			fullName: row.fullName,
			photoUrl: this.storageUrl(row.photoPath),
			academicYear: row.academicYear,
			levelName: row.levelName,
			grade: row.grade,
			subGrade: row.subGrade,
			fatherName: row.fatherName,
		}
	}

	private async findTransactions(studentGradeId: number, status: "valid" | "invalid"): Promise<InvoiceTransactionRow[]> {
		const rows = await this.dataSource.query<TransactionSqlRow[]>(sql.STUDENT_TRANSACTIONS_SQL, [studentGradeId, status])
		return rows.map((row) => ({
			id: Number(row.id),
			transactionCode: row.transactionCode,
			paidAt: row.paidAt,
			paidAtTs: row.paidAtTs === null ? null : Number(row.paidAtTs),
			amount: toAmount(row.amount),
			itemCount: row.itemCount,
			description: row.description,
			...(status === "invalid" ? { cancelNote: row.cancelNote } : {}),
		}))
	}

	/** PHP `storage_url()`: an absolute URL passes through, anything else is an S3 key. */
	private storageUrl(path: string | null): string | null {
		if (!path) return null
		if (/^https?:\/\//i.test(path)) return path
		const base = (this.configService.get("AWS_S3_URL", { infer: true }) ?? "").replace(/\/+$/, "")
		const bucket = this.configService.get("AWS_S3_BUCKET", { infer: true }) ?? ""
		const key = path.replace(/^\/?storage\//, "")
		return base && bucket ? `${base}/${bucket}/${key}` : key
	}
}
