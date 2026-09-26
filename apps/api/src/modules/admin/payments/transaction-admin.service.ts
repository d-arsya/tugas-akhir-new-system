import { Injectable, NotFoundException } from "@nestjs/common"
import { DataSource } from "typeorm"
import type {
	InvoiceStudentCard,
	ServerTableResult,
	StudentTransactionDetail,
	StudentTransactionListRow,
} from "@roja/types"

import { StorageService } from "@core/storage/storage.service"
import { toAmount } from "@shared/billing/invoice-calculator"
import type { StudentTransactionListFilter } from "@admin/payments/dto/transaction-admin.dto"
import { SqlParams } from "@admin/common/sql"
import * as sql from "@admin/payments/transaction-sql"

// Legacy `StudentTransactionController` — the Riwayat Transaksi index and detail.
// Owned by WS P1-C.
//
// Nothing here re-derives "how much has an invoice been paid": this page reports the pivot
// columns of one transaction (`pay` and the `amount` snapshot), which is a different question.
// `invoice-calculator` stays the only answer to the other one.

type ListRow = Omit<StudentTransactionListRow, "id" | "amount" | "paidAtTs"> & {
	id: string
	amount: string | null
	paidAtTs: string | null
}

type DetailRow = {
	id: string
	transactionCode: string | null
	paidAt: string | null
	createdAt: string | null
	amount: string | null
	description: string | null
	note: string | null
	status: "valid" | "invalid"
	cancelNote: string | null
	studentGradeId: string | null
	gradeStudentId: string | null
	fullName: string | null
	grade: string | null
	subGrade: string | null
	fatherName: string | null
	levelName: string | null
}

type ItemRow = {
	invoiceId: string
	name: string | null
	dueDate: string | null
	pay: string | null
	amount: string | null
}

type StudentRow = {
	id: string
	nis: string | null
	academicYear: string | null
	attachPhoto: string | null
}

@Injectable()
export class TransactionAdminService {
	constructor(
		private readonly dataSource: DataSource,
		private readonly storageService: StorageService,
	) {}

	/**
	 * `@listTransactionServer:57-150`. Server-side paged, grouped per transaction, filtered to
	 * `status = 'valid'` — with the ungrouped `orWhere` leak of `:127-134` closed, so cancelled
	 * transactions can no longer be searched back into the list (see `transaction-sql.ts`).
	 */
	async findAll(query: StudentTransactionListFilter): Promise<ServerTableResult<StudentTransactionListRow>> {
		const orderBy = query.orderBy ?? sql.DEFAULT_SORT.orderBy
		const orderDir = (query.orderDir ?? sql.DEFAULT_SORT.orderDir).toUpperCase()

		const totalParams = new SqlParams()
		const totalWhere = sql.transactionListWhere({}, totalParams)

		const filterParams = new SqlParams()
		const filterWhere = sql.transactionListWhere(query, filterParams)

		const pageParams = new SqlParams()
		const pageWhere = sql.transactionListWhere(query, pageParams)
		const limitExpr = pageParams.add(query.limit)
		const offsetExpr = pageParams.add((query.page - 1) * query.limit)

		const [totals, filtered, rows] = await Promise.all([
			this.dataSource.query<{ total: number }[]>(sql.transactionCountSql(totalWhere), totalParams.values),
			this.dataSource.query<{ total: number }[]>(sql.transactionCountSql(filterWhere), filterParams.values),
			this.dataSource.query<ListRow[]>(
				sql.transactionListSql(pageWhere, sql.TRANSACTION_SORT_SQL[orderBy], orderDir, limitExpr, offsetExpr),
				pageParams.values,
			),
		])

		return {
			rows: rows.map((row) => ({
				...row,
				id: Number(row.id),
				amount: toAmount(row.amount),
				// `:99` — the hidden `d-none` unix sort key the legacy cell carried
				paidAtTs: row.paidAtTs === null ? null : Number(row.paidAtTs),
			})),
			recordsTotal: totals[0]?.total ?? 0,
			recordsFiltered: filtered[0]?.total ?? 0,
		}
	}

	/**
	 * `@edit:235-261` and `student-transaction/detail.blade.php`.
	 *
	 * Legacy's own arithmetic here is not transcribed. `:243` iterates
	 * `$item->studentTransactions`, a `belongsToMany` to `StudentTransaction`, so `$value->amount`
	 * is the **whole transaction's** total rather than `pivot.pay`; `$amount[]` is declared once
	 * at `:240` and never reset, so the second installment invoice in a payment subtracts the
	 * first one's transactions too; and no `status` predicate filters out cancelled transactions.
	 * The sibling page `StudentInvoiceController@editTransaction:628-634` does the same job
	 * correctly — `Σ pivot.amount`, `Σ pivot.pay`, and their difference — so this follows that,
	 * which also keeps the two payment-detail screens agreeing with each other.
	 */
	async findOne(transactionId: number): Promise<StudentTransactionDetail> {
		const detailRows = await this.dataSource.query<DetailRow[]>(sql.TRANSACTION_DETAIL_SQL, [transactionId])
		const detail = detailRows[0]
		if (!detail) throw new NotFoundException("Data pembayaran tidak ditemukan.")

		const items = await this.dataSource.query<ItemRow[]>(sql.TRANSACTION_ITEMS_SQL, [transactionId])

		// `:237` reads `$transaction->studentInvoices()->first()->student_id`, which is a fatal
		// error when the payment has no links — transaction 9757 is live in that state (valid,
		// Rp 1.000.000, zero pivot rows). Falling back to the transaction's own grade keeps the
		// page rendering instead of 500ing.
		const invoiceStudentId = items.length > 0 ? await this.invoiceStudentId(items[0]!.invoiceId) : null
		const studentId = invoiceStudentId ?? (detail.gradeStudentId === null ? null : Number(detail.gradeStudentId))

		const studentRows =
			studentId === null
				? []
				: await this.dataSource.query<StudentRow[]>(sql.TRANSACTION_STUDENT_SQL, [studentId])
		const student = studentRows[0]

		const mapped = items.map((item) => ({
			invoiceId: Number(item.invoiceId),
			name: item.name,
			dueDate: item.dueDate,
			pay: toAmount(item.pay),
			amount: toAmount(item.amount),
		}))

		const totalAmount = mapped.reduce<number>((sum, item) => sum + item.amount, 0)
		const totalPaid = mapped.reduce<number>((sum, item) => sum + item.pay, 0)

		return {
			id: Number(detail.id),
			transactionCode: detail.transactionCode,
			paidAt: detail.paidAt,
			createdAt: detail.createdAt,
			amount: toAmount(detail.amount),
			description: detail.description,
			note: detail.note,
			status: detail.status,
			cancelNote: detail.cancelNote,
			student: await this.studentCard(detail, student),
			items: mapped,
			totalAmount,
			totalPaid,
			balance: totalAmount - totalPaid,
		}
	}

	private async invoiceStudentId(invoiceId: string): Promise<number | null> {
		const rows = await this.dataSource.query<{ studentId: string | null }[]>(
			`SELECT si.student_id AS "studentId" FROM tbr_student_invoices si WHERE si.id = $1`,
			[invoiceId],
		)
		const value = rows[0]?.studentId
		return value === null || value === undefined ? null : Number(value)
	}

	/**
	 * `detail.blade.php:15-34`. NISP, photo and the academic-year badge come from the student on
	 * the first linked invoice; name, jenjang, kelas and the parent come from the transaction's
	 * own `studentGradeWithTrashed`.
	 */
	private async studentCard(detail: DetailRow, student: StudentRow | undefined): Promise<InvoiceStudentCard> {
		return {
			studentGradeId: detail.studentGradeId === null ? 0 : Number(detail.studentGradeId),
			studentId: student ? Number(student.id) : 0,
			nis: student?.nis ?? null,
			fullName: detail.fullName,
			photoUrl: await this.photoUrl(student?.attachPhoto ?? null),
			academicYear: student?.academicYear ?? null,
			levelName: detail.levelName,
			grade: detail.grade,
			subGrade: detail.subGrade,
			fatherName: detail.fatherName,
		}
	}

	/** `storage_url()` (`Helper.php:999-1020`): absolute passes through, else strip `storage/`. */
	private async photoUrl(photo: string | null): Promise<string | null> {
		if (!photo) return null
		const key = photo.replace(/^\/?storage\//, "").replace(/^\/+/, "")
		return this.storageService.getUrl(key)
	}
}
