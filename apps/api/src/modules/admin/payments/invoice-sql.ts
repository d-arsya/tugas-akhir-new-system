import { LOCAL_TIMESTAMP, TIMEZONE, truthy, type SqlParams } from "@admin/common/sql"
import type { InvoiceBillInput, StudentInvoiceListInput } from "@admin/payments/dto/invoice-admin.dto"

// Raw SQL for the read half of Tagihan Santri — legacy `StudentInvoiceController`
// `@studentListServerSide`, `@edit`, `@listBillServerSide`, `@listTransaction`, `@listCancel`
// and `@detailBill`.
//
// **Nothing here joins `tbr_accountancies`.** 496 live invoices (Rp 160,3 juta) still point at
// accountancy ids that were deleted, so any join to that table must be a LEFT JOIN or those rows
// vanish from every list and total. Legacy filters the cost dropdown on `student_invoices.name`
// rather than the account, so the read half needs no join at all — the account list is a
// standalone query. Money columns are `bigint`, which node-postgres returns as strings, so the
// service normalises every figure through `toAmount()`.

const TODAY = `(now() AT TIME ZONE '${TIMEZONE}')::date`

// ─── The santri picker (`@studentListServerSide`) ────────────────────────────

// `StudentGrade::query()->leftjoin('students')`. `StudentGrade` uses `SoftDeletes`, so the base
// model adds `deleted_at IS NULL`; a joined table gets no scope of its own.
const STUDENT_FROM = `
	FROM tbr_student_grades sg
	LEFT JOIN tbr_students s ON sg.student_id = s.id`
const STUDENT_BASE_WHERE = "sg.deleted_at IS NULL"

export const studentWhere = (filter: StudentInvoiceListInput, params: SqlParams): string => {
	const conditions = [STUDENT_BASE_WHERE]

	// `ctype_digit($search)` picks the column: an all-digit term searches NISP, anything else the
	// name. The case-sensitivity is legacy's too — `LIKE` on `nis`, `ILIKE` on `fullname`.
	if (filter.search !== undefined) {
		const term = params.add(`%${filter.search}%`)
		conditions.push(/^\d+$/.test(filter.search) ? `s.nis LIKE ${term}` : `sg.fullname ILIKE ${term}`)
	}

	// Legacy applies each filter twice (a combined branch, then one per field); the duplicates are
	// identical predicates. `sg.grade` is an `int` column while the select2 posts the label as text.
	if (filter.grade !== undefined) conditions.push(`sg.grade::text = ${params.add(filter.grade)}`)
	if (filter.subGrade !== undefined) conditions.push(`sg.sub_grade = ${params.add(filter.subGrade)}`)

	return `WHERE ${conditions.join(" AND ")}`
}

const STUDENT_ORDER: Record<string, string> = {
	nis: "s.nis",
	fullName: "sg.fullname",
	// Legacy sorts this column by `father_fullname` alone, not by the displayed fallback
	parentOrGuardian: "sg.father_fullname",
	grade: "sg.grade",
	subGrade: "sg.sub_grade",
	invoiceCount: '"invoiceCount"',
	unpaidCount: '"unpaidCount"',
}

/** `sg.id` is the tie-break legacy omits, without which paging over ties is non-deterministic. */
export const studentOrderBy = (filter: StudentInvoiceListInput): string =>
	`ORDER BY ${STUDENT_ORDER[filter.orderBy ?? "nis"]} ${filter.orderDir === "desc" ? "DESC" : "ASC"}, sg.id ASC`

export const studentCountSql = (where: string): string => `SELECT COUNT(*)::int AS total ${STUDENT_FROM} ${where}`
/** `recordsTotal` — every santri, before the search box or the two select2 filters. */
export const STUDENT_TOTAL_SQL = `SELECT COUNT(*)::int AS total
	FROM tbr_student_grades sg
	WHERE ${STUDENT_BASE_WHERE}`

export const studentRowsSql = (where: string, order: string, limit: string, offset: string): string => `
	SELECT sg.id AS "studentGradeId",
		s.id AS "studentId",
		s.nis,
		sg.fullname AS "fullName",
		CASE WHEN ${truthy("sg.father_fullname")} THEN sg.father_fullname ELSE sg.guardian_fullname END AS "parentOrGuardian",
		sg.grade::text AS grade,
		sg.sub_grade AS "subGrade",
		COUNT(*) FILTER (WHERE si.validity_status)::int AS "invoiceCount",
		COUNT(*) FILTER (WHERE si.status = 'unpaid' AND si.validity_status)::int AS "unpaidCount"
	${STUDENT_FROM}
	LEFT JOIN tbr_student_invoices si ON sg.id = si.student_grade_id
	${where}
	GROUP BY sg.id, s.id, s.nis
	${order}
	LIMIT ${limit} OFFSET ${offset}`

// ─── The Tagihan tab (`@listBillServerSide`) ─────────────────────────────────
/**
 * `COALESCE(SUM(CASE WHEN student_transactions.status = 'valid' THEN pay ELSE 0 END), 0)`, lifted
 * out of legacy's join + `GROUP BY` into a lateral so the invoice row is never multiplied.
 * `COALESCE(pay, amount)` is the calculator's `link.pay ?? link.amount`; no live row has a null
 * `pay`, so the fallback never fires today and the two agree exactly.
 */
export const PAID_LATERAL = `
	LEFT JOIN LATERAL (
		SELECT COALESCE(SUM(COALESCE(sit.pay, sit.amount)), 0) AS paid_sum
		FROM tbr_student_invoice_transactions sit
		JOIN tbr_student_transactions st ON st.id = sit.student_transaction_id
		WHERE sit.student_invoice_id = si.id AND st.status = 'valid'
	) p ON true`

/**
 * Mirrors `calculatePaid()` — including the rule that a stored `paid` the links do not add up to is
 * trusted over the sum (15 live valid invoices, superseded by a re-published kesanggupan). Ordering
 * and paging use this expression, so the page the server slices matches the figures the calculator
 * then produces for it.
 */
export const PAID_EXPR = `CASE
		WHEN si.status = 'paid' AND p.paid_sum < COALESCE(si.amount, 0) THEN COALESCE(si.amount, 0)
		ELSE p.paid_sum
	END`

const BILL_FROM = `FROM tbr_student_invoices si ${PAID_LATERAL}`

// Legacy scopes by `student_grades.id` through a `leftjoin`, which applies no soft-delete scope;
// the foreign key on the invoice says the same thing without the join.
export const billWhere = (studentGradeId: number, filter: InvoiceBillInput, params: SqlParams): string => {
	const conditions = [`si.student_grade_id = ${params.add(studentGradeId)}`, "si.validity_status"]

	// The two eye-toggles. Both `deactive` is the default and is **not** "show everything": it
	// narrows to unpaid invoices already past their reminder date.
	if (filter.paid === "deactive" && filter.unpaid === "deactive") {
		conditions.push(`(si.status = 'unpaid' AND si.reminder < ${TODAY})`)
	} else if (filter.paid === "active" && filter.unpaid === "deactive") {
		// `->where(status,'paid')->orWhereDate(reminder,'<',now())`, already inside a closure
		conditions.push(`(si.status = 'paid' OR si.reminder < ${TODAY})`)
	} else if (filter.unpaid === "active" && filter.paid === "deactive") {
		conditions.push("si.status = 'unpaid'")
	}
	// Both `active` matches none of legacy's `when()` branches, so no status condition at all.

	if (filter.search !== undefined) {
		const term = params.add(`%${filter.search}%`)
		// F-1: legacy's two `whereRaw`s name `student_invoices` without the `tbr_` prefix, so any
		// search here is a hard 500. F-2: they were also chained as bare `orWhere`s, and AND binds
		// tighter than OR, so the student scope fell away and other santri's invoices appeared,
		// tickable and payable — searching "paid" returned all 22,563. Grouped.
		conditions.push(
			`(si.name LIKE ${term}` +
				` OR si.amount::text LIKE ${term}` +
				` OR si.status LIKE ${term}` +
				` OR si.payment_method LIKE ${term}` +
				` OR si.due_date::text LIKE ${term})`,
		)
	} else if (filter.cost !== undefined) {
		// Legacy's `else if`: the cost dropdown only applies while the search box is empty
		conditions.push(`si.name LIKE ${params.add(`%${filter.cost}%`)}`)
	}

	return `WHERE ${conditions.join(" AND ")}`
}

const BILL_ORDER: Record<string, string> = {
	name: "si.name",
	amount: "si.amount",
	paid: PAID_EXPR,
	// F-11: legacy orders this column by `balance_tagihan`, which is not an alias anywhere — a 500
	balance: `(COALESCE(si.amount, 0) - (${PAID_EXPR}))`,
	status: "si.status",
	dueDate: "si.due_date",
}

export const billOrderBy = (filter: InvoiceBillInput): string =>
	`ORDER BY ${BILL_ORDER[filter.orderBy ?? "dueDate"]} ${filter.orderDir === "desc" ? "DESC" : "ASC"}, si.id ASC`

export const billCountSql = (where: string): string => `SELECT COUNT(*)::int AS total ${BILL_FROM} ${where}`

export const billRowsSql = (where: string, order: string, limit: string, offset: string): string => `
	SELECT si.id,
		si.name,
		si.amount,
		si.status,
		si.payment_method AS "paymentMethod",
		to_char(si.due_date, 'YYYY-MM-DD') AS "dueDate",
		-- Carbon::create($due_date)->timestamp is local midnight, not UTC midnight, and legacy's
		-- rowCallback compares it against now() — so an invoice due today is already past due
		EXTRACT(EPOCH FROM si.due_date::timestamp AT TIME ZONE '${TIMEZONE}')::bigint AS "dueDateTs",
		si.due_date <= ${TODAY} AS "pastDue"
	${BILL_FROM}
	${where}
	${order}
	LIMIT ${limit} OFFSET ${offset}`

// ─── The Riwayat Pembayaran / Dibatalkan tabs (`@listTransaction`, `@listCancel`) ─────

/** Both tabs are one query with a different `status`; `latest()` orders by `created_at` desc. */
export const STUDENT_TRANSACTIONS_SQL = `SELECT st.id,
		st.student_transaction_code::text AS "transactionCode",
		${LOCAL_TIMESTAMP("st.paid_at")} AS "paidAt",
		EXTRACT(EPOCH FROM st.paid_at)::bigint AS "paidAtTs",
		st.amount,
		(
			SELECT COUNT(*) FROM tbr_student_invoice_transactions sit
			 WHERE sit.student_transaction_id = st.id
		)::int AS "itemCount",
		st."desc" AS description,
		st.cancel_note AS "cancelNote"
	FROM tbr_student_transactions st
	WHERE st.student_grade_id = $1 AND st.status = $2
	ORDER BY st.created_at DESC, st.id DESC`

// ─── One invoice (`@detailBill`) ─────────────────────────────────────────────
export const INVOICE_SQL = `SELECT si.id,
		si.name,
		si.amount,
		si.status,
		si.payment_method AS "paymentMethod",
		si.note,
		si.student_grade_id AS "studentGradeId",
		to_char(si.due_date, 'YYYY-MM-DD') AS "dueDate",
		${LOCAL_TIMESTAMP("si.created_at")} AS "createdAt"
	FROM tbr_student_invoices si
	WHERE si.id = $1`

// The "Item transaksi" table. Legacy lists only valid transactions but prints `$amount[$key]`, an
// array built over **every** pivot row with 0 for the cancelled ones, so one cancellation shifted
// every later row's figure. The pivot `pay` travels with its own row here instead.
export const INVOICE_TRANSACTIONS_SQL = `SELECT st.id,
		st.student_transaction_code::text AS "transactionCode",
		st.note,
		${LOCAL_TIMESTAMP("st.paid_at")} AS "paidAt",
		sit.pay
	FROM tbr_student_invoice_transactions sit
	JOIN tbr_student_transactions st ON st.id = sit.student_transaction_id
	WHERE sit.student_invoice_id = $1 AND st.status = 'valid'
	ORDER BY sit.id`
