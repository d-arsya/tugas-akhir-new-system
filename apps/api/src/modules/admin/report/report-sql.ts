import { parseDmy, REPORT_TIMEZONE } from "./report-format"
import type { ArrearFilter, IncomeFilter } from "@admin/dto/admin-report.dto"

// Collects positional parameters ($1, $2 …) for raw SQL
export class SqlParams {
	readonly values: unknown[] = []

	add(value: unknown): string {
		this.values.push(value)
		return `$${this.values.length}`
	}
}

// Legacy `whereDate()` compares the date part in the app timezone
export const localDate = (column: string): string => `(${column} AT TIME ZONE '${REPORT_TIMEZONE}')::date`

// Legacy only filters dates when both ends are present
export const dateRange = (filter: { from?: string | undefined; to?: string | undefined }): { from: string; to: string } | null => {
	const from = parseDmy(filter.from)
	const to = parseDmy(filter.to)
	return from && to ? { from, to } : null
}

// Case-insensitive search over the text form of each column; the term is not escaped (legacy)
const likeAny = (columns: string[], search: string, params: SqlParams): string => {
	const term = params.add(`%${search}%`)
	return `(${columns.map((column) => `${column}::text ILIKE ${term}`).join(" OR ")})`
}

// ─── Income detail (ReportController::baseDetailQuery + filterDetailDt) ───

export const DETAIL_FROM = `
	FROM tbr_student_transactions st
	JOIN tbr_student_invoice_transactions sit ON st.id = sit.student_transaction_id
	JOIN tbr_student_invoices si ON sit.student_invoice_id = si.id
	JOIN tbr_student_grades sg ON st.student_grade_id = sg.id
	JOIN tbr_students s ON sg.student_id = s.id`

export const DETAIL_GROUP_BY = `
	GROUP BY st.id, st.student_transaction_code, s.nis, sg.fullname, st.amount, sg.grade, sg.sub_grade,
		sg.current_academic_year, st.created_at, st.paid_at`

export const detailWhere = (filter: IncomeFilter, params: SqlParams): string => {
	const conditions = ["st.status = 'valid'"]
	if (filter.search) {
		conditions.push(
			likeAny(
				["st.student_transaction_code", "st.amount", 'st."desc"', "sg.fullname", "sg.grade", "sg.sub_grade", "s.nis"],
				filter.search,
				params,
			),
		)
	}
	if (filter.academicYear) conditions.push(`sg.current_academic_year = ${params.add(filter.academicYear)}`)
	const range = dateRange(filter)
	if (range) {
		conditions.push(`${localDate("st.paid_at")} >= ${params.add(range.from)}::date`)
		conditions.push(`${localDate("st.paid_at")} <= ${params.add(range.to)}::date`)
	}
	if (filter.grade) conditions.push(`sg.grade::text = ${params.add(filter.grade)}`)
	if (filter.subGrade) conditions.push(`sg.sub_grade = ${params.add(filter.subGrade)}`)
	return `WHERE ${conditions.join(" AND ")}`
}

// ─── Income recap (ReportController::filterRecapInvoiceDt + calculateTotalAmount) ───

// `whereHas('studentGrade', …)` — Eloquent adds the SoftDeletes scope only when a grade filter is set.
// `alias` is a LEFT JOIN on tbr_student_grades already restricted to `deleted_at IS NULL`
const gradeMatch = (alias: string, filter: IncomeFilter, params: SqlParams): string | null => {
	const conditions: string[] = []
	if (filter.academicYear) conditions.push(`${alias}.current_academic_year = ${params.add(filter.academicYear)}`)
	if (filter.grade) conditions.push(`${alias}.grade::text = ${params.add(filter.grade)}`)
	if (filter.subGrade) conditions.push(`${alias}.sub_grade = ${params.add(filter.subGrade)}`)
	return conditions.length === 0 ? null : `(${alias}.id IS NOT NULL AND ${conditions.join(" AND ")})`
}

// Set-based: legacy loops invoice by invoice; here every pivot row is aggregated once per invoice
export const recapSql = (filter: IncomeFilter, params: SqlParams): string => {
	const range = dateRange(filter)
	const inRange = range ? `l.paid_date BETWEEN ${params.add(range.from)}::date AND ${params.add(range.to)}::date` : null

	// Installments and multi-transaction invoices count the pivot `pay` of matching valid transactions
	const payConditions = ["l.status = 'valid'"]
	const transactionGrade = gradeMatch("tg", filter, params)
	if (transactionGrade) payConditions.push(transactionGrade)
	if (inRange) payConditions.push(inRange)

	const invoiceConditions = ["si.accountancy_id IN (SELECT id FROM acc)", "pi.has_valid"]
	// Legacy checks the date range in a separate whereHas, so it may match a different (even invalid) transaction
	if (inRange) invoiceConditions.push("pi.in_range")
	const invoiceGrade = gradeMatch("ig", filter, params)
	if (invoiceGrade) invoiceConditions.push(invoiceGrade)

	return `
		WITH acc AS (
			SELECT id, name FROM tbr_accountancies WHERE parent_id IS NOT NULL AND is_student_cost = true
		),
		l AS (
			SELECT x.student_invoice_id AS invoice_id, x.pay, t.status, t.student_grade_id,
				${localDate("t.paid_at")} AS paid_date
			FROM tbr_student_invoice_transactions x
			JOIN tbr_student_transactions t ON t.id = x.student_transaction_id
		),
		pi AS (
			SELECT l.invoice_id,
				COUNT(*) AS tx_count,
				BOOL_OR(l.status = 'valid') AS has_valid,
				BOOL_OR(${inRange ?? "true"}) AS in_range,
				COALESCE(SUM(l.pay) FILTER (WHERE ${payConditions.join(" AND ")}), 0) AS pay_sum
			FROM l
			LEFT JOIN tbr_student_grades tg ON tg.id = l.student_grade_id AND tg.deleted_at IS NULL
			GROUP BY l.invoice_id
		),
		inv AS (
			SELECT si.id, si.accountancy_id, si.created_at,
				CASE
					WHEN (si.status = 'unpaid' AND si.payment_method = 'installment') OR pi.tx_count > 1 THEN pi.pay_sum
					ELSE si.amount
				END AS calc
			FROM tbr_student_invoices si
			JOIN pi ON pi.invoice_id = si.id
			LEFT JOIN tbr_student_grades ig ON ig.id = si.student_grade_id AND ig.deleted_at IS NULL
			WHERE ${invoiceConditions.join(" AND ")}
		)
		SELECT acc.name AS acc_name, COALESCE(SUM(inv.calc), 0) AS total,
			to_char(MIN(inv.created_at) AT TIME ZONE '${REPORT_TIMEZONE}', 'YYYY-MM-DD') AS first_at,
			to_char(MAX(inv.created_at) AT TIME ZONE '${REPORT_TIMEZONE}', 'YYYY-MM-DD') AS last_at
		FROM acc LEFT JOIN inv ON inv.accountancy_id = acc.id
		GROUP BY acc.id, acc.name
		ORDER BY acc.id`
}

// ─── Arrears (ReportArrearController::baseArrearQuery + filterArrearDt) ───

export const ARREAR_FROM = `
	FROM tbr_student_invoices si
	LEFT JOIN tbr_students s ON si.student_id = s.id
	LEFT JOIN tbr_student_grades sg ON si.student_grade_id = sg.id
	LEFT JOIN tbr_accountancies a ON si.accountancy_id = a.id
	LEFT JOIN (
		SELECT student_invoice_id, SUM(pay) AS payed FROM tbr_student_invoice_transactions GROUP BY student_invoice_id
	) p ON si.id = p.student_invoice_id`

export const ARREAR_FINAL_AMOUNT = `CASE
		WHEN si.payment_method = 'installment' AND si.status = 'unpaid' THEN si.amount - COALESCE(p.payed, 0)
		ELSE si.amount
	END`

export const arrearWhere = (filter: ArrearFilter, params: SqlParams): string => {
	const conditions = [
		"si.validity_status = true",
		// PHP now() in the app timezone, compared against the DATE column
		`si.due_date < (now() AT TIME ZONE '${REPORT_TIMEZONE}')`,
		"si.status = 'unpaid'",
	]
	if (filter.search) {
		conditions.push(
			likeAny(
				["s.nis", "sg.fullname", "si.name", "si.amount", "si.due_date", "si.due_date_grade", "si.due_date_sub_grade"],
				filter.search,
				params,
			),
		)
	}
	if (filter.academicYear) conditions.push(`si.due_date_academic_year = ${params.add(filter.academicYear)}`)
	if (filter.accountancy) conditions.push(`a.name = ${params.add(filter.accountancy)}`)
	const range = dateRange(filter)
	if (range) {
		conditions.push(`si.due_date >= ${params.add(range.from)}::date`)
		conditions.push(`si.due_date <= ${params.add(range.to)}::date`)
	}
	if (filter.grade) conditions.push(`si.due_date_grade = ${params.add(filter.grade)}`)
	if (filter.subGrade) conditions.push(`si.due_date_sub_grade = ${params.add(filter.subGrade)}`)
	return `WHERE ${conditions.join(" AND ")}`
}
