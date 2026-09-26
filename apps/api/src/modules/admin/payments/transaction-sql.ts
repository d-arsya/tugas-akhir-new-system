// Raw SQL for Riwayat Transaksi — legacy `StudentTransactionController@listTransactionServer`
// (`:57-165`) and `@edit` (`:235-261`).
//
// Legacy's list is one yajra `datatables()->of(...)` over a five-table join, grouped by
// transaction. `listTransaction` / `listTransactionAll` are dead (their blade calls are
// commented out and `listTransaction` calls a `studentGrades()` relation that does not
// exist on `StudentTransaction`), so nothing here ports them.
//
// Two legacy defects are fixed rather than transcribed — see `transactionListWhere` (F-2)
// and the sort defaults in `transaction-admin.dto.ts` (`:59-60`).

import { parseDmy } from "@admin/common/date-format"
import { LOCAL_TIMESTAMP, localDate, type SqlParams } from "@admin/common/sql"

/**
 * `:67-70`. Every join is a LEFT JOIN in legacy and stays one here.
 *
 * `tbr_students` hangs off **`student_invoices.student_id`**, not off the transaction's own
 * `student_grade_id` — so a transaction with no pivot rows keeps its `fullname` (which comes
 * from the direct grade join) but reports a NULL `nis`. One such row is live: transaction
 * 9757, `valid`, Rp 1.000.000, zero links.
 *
 * Legacy's `leftjoin()` is a query-builder join, so the `SoftDeletes` global scope on
 * `StudentGrade` and `Student` never applies — trashed rows still join. `@edit` agrees, using
 * `studentGradeWithTrashed` and `Student::withTrashed()`. No `deleted_at` predicate here.
 */
const LIST_FROM = `
	FROM tbr_student_transactions st
	LEFT JOIN tbr_student_grades sg ON st.student_grade_id = sg.id
	LEFT JOIN tbr_student_invoice_transactions sit ON st.id = sit.student_transaction_id
	LEFT JOIN tbr_student_invoices si ON sit.student_invoice_id = si.id
	LEFT JOIN tbr_students s ON si.student_id = s.id`

/** `:85-95` — grouped per transaction. Verified on the clone: 9.564 groups for 9.564 valid rows. */
const LIST_GROUP_BY = `
	GROUP BY st.id, st.paid_at, st.student_transaction_code, st.amount, st."desc",
		s.nis, sg.fullname, sg.grade, sg.sub_grade`

export type TransactionListFilter = {
	search?: string | undefined
	from?: string | undefined
	to?: string | undefined
}

/**
 * `:123-146`.
 *
 * **F-2 fix.** Legacy chains `->where(code LIKE)->orWhereRaw(amount)->orWhere(desc)…`
 * ungrouped on top of the base `->where('student_transactions.status','valid')` (`:83`).
 * `AND` binds tighter than `OR`, so the predicate legacy actually runs is
 * `(status='valid' AND code LIKE …) OR amount LIKE … OR desc LIKE … OR …` — cancelled
 * `invalid` transactions surface in a list whose one stated filter is valid-only (148 live
 * `invalid` rows). The OR group is wrapped here so the status predicate always holds.
 *
 * The search term and the date range stay **mutually exclusive** (legacy's `else if` at
 * `:136`): typing in the search box silently drops the date filter. Kept as legacy.
 *
 * `ILIKE` rather than legacy's case-sensitive `LIKE`, matching the already-shipped Laporan
 * module (`report-sql.ts:26`) which searches the same columns on the same tables.
 */
export const transactionListWhere = (filter: TransactionListFilter, params: SqlParams): string => {
	const conditions = ["st.status = 'valid'"]

	if (filter.search) {
		const term = params.add(`%${filter.search}%`)
		const columns = [
			"st.student_transaction_code",
			"st.amount",
			'st."desc"',
			"sg.fullname",
			"sg.grade",
			"sg.sub_grade",
			"s.nis",
		]
		conditions.push(`(${columns.map((column) => `${column}::text ILIKE ${term}`).join(" OR ")})`)
	} else {
		// `:140` — legacy only filters when BOTH ends parse
		const from = parseDmy(filter.from)
		const to = parseDmy(filter.to)
		if (from && to) {
			conditions.push(`${localDate("st.paid_at")} >= ${params.add(from)}::date`)
			conditions.push(`${localDate("st.paid_at")} <= ${params.add(to)}::date`)
		}
	}

	return `WHERE ${conditions.join(" AND ")}`
}

/** `orderCol()` `:152-165`, keyed by the contract's row fields instead of DataTables indices. */
export const TRANSACTION_SORT_SQL = {
	paidAt: "st.paid_at",
	amount: "st.amount",
	itemCount: "count(si.id)",
	description: 'st."desc"',
	nis: "s.nis",
	fullName: "sg.fullname",
	grade: "sg.grade",
} as const

export type TransactionSortKey = keyof typeof TRANSACTION_SORT_SQL

/** `student-transaction-serverside.js:36` — `order: [[1, "desc"]]`, i.e. `paid_at` descending. */
export const DEFAULT_SORT: { orderBy: TransactionSortKey; orderDir: "asc" | "desc" } = {
	orderBy: "paidAt",
	orderDir: "desc",
}

/** `recordsTotal` — the base query before `filter()` runs. */
export const transactionCountSql = (where: string): string =>
	`SELECT count(*)::int AS total FROM (SELECT st.id ${LIST_FROM} ${where} ${LIST_GROUP_BY}) g`

/**
 * `:71-96`. `item` is `count(student_invoices.id)`, which is 0 for a transaction with no
 * pivot rows because `count()` skips NULLs.
 *
 * `st.id DESC` is appended as a tie-break. Legacy has none, which leaves server-side paging
 * free to repeat or skip rows between draws whenever the sort column ties — `paid_at` ties on
 * every payment recorded in the same second.
 */
export const transactionListSql = (where: string, orderExpr: string, orderDir: string, limitExpr: string, offsetExpr: string): string =>
	`SELECT st.id,
		st.student_transaction_code::text AS "transactionCode",
		${LOCAL_TIMESTAMP("st.paid_at")} AS "paidAt",
		extract(epoch FROM st.paid_at)::bigint AS "paidAtTs",
		st.amount,
		count(si.id)::int AS "itemCount",
		st."desc" AS description,
		s.nis,
		sg.fullname AS "fullName",
		sg.grade::text AS grade,
		sg.sub_grade AS "subGrade"
	${LIST_FROM}
	${where}
	${LIST_GROUP_BY}
	ORDER BY ${orderExpr} ${orderDir} NULLS LAST, st.id DESC
	LIMIT ${limitExpr} OFFSET ${offsetExpr}`

// ─── Detail (`@edit:235-261`) ────────────────────────────────────

/**
 * The transaction itself plus the grade card. `@edit` reads the grade through
 * `studentGradeWithTrashed`, so no `deleted_at` predicate.
 */
export const TRANSACTION_DETAIL_SQL = `SELECT st.id,
		st.student_transaction_code::text AS "transactionCode",
		${LOCAL_TIMESTAMP("st.paid_at")} AS "paidAt",
		${LOCAL_TIMESTAMP("st.created_at")} AS "createdAt",
		st.amount,
		st."desc" AS description,
		st.note,
		st.status,
		st.cancel_note AS "cancelNote",
		st.student_grade_id AS "studentGradeId",
		sg.student_id AS "gradeStudentId",
		sg.fullname AS "fullName",
		sg.grade::text AS grade,
		sg.sub_grade AS "subGrade",
		sg.father_fullname AS "fatherName",
		l.name AS "levelName"
	FROM tbr_student_transactions st
	LEFT JOIN tbr_student_grades sg ON sg.id = st.student_grade_id
	LEFT JOIN tbr_levels l ON l.id = sg.level_id
	WHERE st.id = $1`

/**
 * `:239` `$transaction->studentInvoices` — the pivot rows with their invoice.
 *
 * Both money columns are returned: `pay` is what this transaction put toward the invoice,
 * `amount` is the invoice snapshot taken when the payment was recorded. They differ in 1.039
 * live pivot rows, so the page must never substitute one for the other.
 *
 * Ordered by pivot id, which is the order `attach()` wrote them and therefore the order the
 * legacy blade's `@foreach ($invoices …)` renders.
 */
export const TRANSACTION_ITEMS_SQL = `SELECT sit.student_invoice_id AS "invoiceId",
		si.name,
		to_char(si.due_date, 'YYYY-MM-DD') AS "dueDate",
		sit.pay,
		sit.amount
	FROM tbr_student_invoice_transactions sit
	LEFT JOIN tbr_student_invoices si ON si.id = sit.student_invoice_id
	WHERE sit.student_transaction_id = $1
	ORDER BY sit.id ASC`

/**
 * `:237-238` — the student card's NISP, photo and academic year come from the student on the
 * **first linked invoice**, not from the transaction's own grade. `Student::withTrashed()`,
 * hence no `deleted_at` predicate; the photo is the student's `grade_status = 'active'` row,
 * which need not be the grade this payment was filed under.
 */
export const TRANSACTION_STUDENT_SQL = `SELECT s.id,
		s.nis,
		ay.year AS "academicYear",
		(
			SELECT g.attach_photo FROM tbr_student_grades g
			 WHERE g.student_id = s.id AND g.grade_status = 'active'
			 ORDER BY g.id ASC LIMIT 1
		) AS "attachPhoto"
	FROM tbr_students s
	LEFT JOIN tbr_academic_years ay ON ay.id = s.academic_year_id
	WHERE s.id = $1`
