import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import type {
	ArrearFilter,
	ArrearQuery,
	ARREAR_SORT_KEYS,
	IncomeDetailQuery,
	IncomeFilter,
	INCOME_DETAIL_SORT_KEYS,
} from "@admin/dto/admin-report.dto"
import { REPORT_TIMEZONE } from "./report-format"
import {
	ARREAR_FINAL_AMOUNT,
	ARREAR_FROM,
	arrearWhere,
	DETAIL_FROM,
	DETAIL_GROUP_BY,
	detailWhere,
	recapSql,
	SqlParams,
} from "./report-sql"

export type ReportOptions = {
	academicYears: string[]
	grades: number[]
	subGrades: string[]
	accountancies: string[]
}

export type IncomeDetailRow = {
	code: string
	// Local (Asia/Jakarta) `yyyy-mm-ddThh:mm:ss`
	paidAt: string | null
	createdAt: string | null
	fullname: string | null
	nis: string | null
	amount: number
	description: string
	grade: number | null
	subGrade: string | null
}

export type RecapRow = { accName: string; totalAmount: number; firstAt: string | null; lastAt: string | null }
export type IncomeRecap = { rows: { accName: string; totalAmount: number }[]; totalAmount: number; totalData: number }

export type ArrearRow = {
	id: number
	nis: string | null
	fullname: string | null
	name: string | null
	amount: number
	dueDate: string | null
	grade: string | null
	subGrade: string | null
}

type PageMeta = { page: number; limit: number; total: number; totalPages: number }
export type IncomeDetailPage = { data: IncomeDetailRow[]; meta: PageMeta & { totalIncome: number } }
export type ArrearPage = { data: ArrearRow[]; meta: PageMeta & { totalArrear: number } }

type Paging = { page: number; limit: number } | null

// DataTables column `name` → SQL expression (legacy yajra orders by the column name)
const DETAIL_SORT: Record<(typeof INCOME_DETAIL_SORT_KEYS)[number], string> = {
	code: "st.student_transaction_code",
	fullname: "sg.fullname",
	nis: "s.nis",
	amount: "st.amount",
	description: "description",
	grade: "sg.grade",
	subGrade: "sg.sub_grade",
}

const ARREAR_SORT: Record<(typeof ARREAR_SORT_KEYS)[number], string> = {
	nis: "s.nis",
	fullname: "sg.fullname",
	name: "si.name",
	amount: "si.amount",
	dueDate: "si.due_date",
	grade: "si.due_date_grade",
	subGrade: "si.due_date_sub_grade",
}

const toNumber = (value: unknown): number => Number(value ?? 0)
const toNullableNumber = (value: unknown): number | null => (value === null || value === undefined ? null : Number(value))
const localTimestamp = (column: string): string =>
	`to_char(${column} AT TIME ZONE '${REPORT_TIMEZONE}', 'YYYY-MM-DD"T"HH24:MI:SS')`

const pageClause = (paging: Paging, params: SqlParams): string =>
	paging ? `LIMIT ${params.add(paging.limit)} OFFSET ${params.add((paging.page - 1) * paging.limit)}` : ""

const pageMeta = (paging: { page: number; limit: number }, total: number): PageMeta => ({
	page: paging.page,
	limit: paging.limit,
	total,
	totalPages: Math.max(1, Math.ceil(total / paging.limit)),
})

// Port of legacy ReportController + ReportArrearController (Laporan Pemasukkan & Tunggakan)
@Injectable()
export class AdminReportService {
	constructor(private readonly dataSource: DataSource) {}

	async getOptions(): Promise<ReportOptions> {
		const [years, grades, subGrades, accountancies] = await Promise.all([
			this.dataSource.query<{ year: string }[]>(
				// Eloquent query on the SoftDeletes StudentGrade model
				`SELECT DISTINCT current_academic_year AS year FROM tbr_student_grades
				WHERE deleted_at IS NULL ORDER BY current_academic_year DESC`,
			),
			this.dataSource.query<{ label: string }[]>("SELECT label FROM tbr_grades ORDER BY id"),
			this.dataSource.query<{ label: string }[]>("SELECT label FROM tbr_sub_grades ORDER BY id"),
			this.dataSource.query<{ name: string }[]>("SELECT name FROM tbr_accountancies WHERE is_student_cost = true ORDER BY id"),
		])
		return {
			// Legacy renders a NULL year as an empty option value, which is the same as "Tahun Ajaran"
			academicYears: years.flatMap((row) => (row.year ? [row.year] : [])),
			grades: grades.map((row) => Number(row.label)),
			subGrades: subGrades.map((row) => row.label),
			accountancies: accountancies.map((row) => row.name),
		}
	}

	async getIncomeDetail(query: IncomeDetailQuery): Promise<IncomeDetailPage> {
		const summary = await this.detailSummary(query)
		const rows = await this.detailRows(query, query, { page: query.page, limit: query.limit })
		return { data: rows, meta: { ...pageMeta(query, summary.total), totalIncome: summary.totalIncome } }
	}

	// Export: every filtered row, ordered by created_at (legacy exportDetail)
	async getIncomeDetailRows(filter: IncomeFilter): Promise<IncomeDetailRow[]> {
		return this.detailRows(filter, {}, null)
	}

	async getIncomeRecap(filter: IncomeFilter): Promise<IncomeRecap> {
		const rows = await this.getIncomeRecapRows(filter)
		return {
			rows: rows.map(({ accName, totalAmount }) => ({ accName, totalAmount })),
			totalAmount: rows.reduce((sum, row) => sum + row.totalAmount, 0),
			totalData: rows.length,
		}
	}

	async getIncomeRecapRows(filter: IncomeFilter): Promise<RecapRow[]> {
		const params = new SqlParams()
		const rows = await this.dataSource.query<{ acc_name: string; total: string; first_at: string | null; last_at: string | null }[]>(
			recapSql(filter, params),
			params.values,
		)
		return rows.map((row) => ({
			accName: row.acc_name,
			totalAmount: toNumber(row.total),
			firstAt: row.first_at,
			lastAt: row.last_at,
		}))
	}

	async getArrears(query: ArrearQuery): Promise<ArrearPage> {
		const params = new SqlParams()
		const where = arrearWhere(query, params)
		const [summary] = await this.dataSource.query<{ total: string; amount: string }[]>(
			`SELECT COUNT(*) AS total, COALESCE(SUM(${ARREAR_FINAL_AMOUNT}), 0) AS amount ${ARREAR_FROM} ${where}`,
			params.values,
		)
		const rows = await this.arrearRows(query, query, { page: query.page, limit: query.limit })
		const total = toNumber(summary?.total)
		return { data: rows, meta: { ...pageMeta(query, total), totalArrear: toNumber(summary?.amount) } }
	}

	async getArrearRows(filter: ArrearFilter): Promise<ArrearRow[]> {
		return this.arrearRows(filter, {}, null)
	}

	private async detailSummary(filter: IncomeFilter): Promise<{ total: number; totalIncome: number }> {
		const params = new SqlParams()
		const [row] = await this.dataSource.query<{ total: string; amount: string }[]>(
			`SELECT COUNT(*) AS total, COALESCE(SUM(amount), 0) AS amount
			FROM (SELECT st.amount ${DETAIL_FROM} ${detailWhere(filter, params)} ${DETAIL_GROUP_BY}) grouped`,
			params.values,
		)
		return { total: toNumber(row?.total), totalIncome: toNumber(row?.amount) }
	}

	private async detailRows(
		filter: IncomeFilter,
		sort: Pick<IncomeDetailQuery, "sortBy" | "sortDir"> | Record<string, never>,
		paging: Paging,
	): Promise<IncomeDetailRow[]> {
		const params = new SqlParams()
		const where = detailWhere(filter, params)
		// No DataTables order → created_at ascending (legacy)
		const order = "sortBy" in sort && sort.sortBy ? `${DETAIL_SORT[sort.sortBy]} ${sort.sortDir.toUpperCase()}` : "st.created_at ASC"
		const rows = await this.dataSource.query<Record<string, unknown>[]>(
			`SELECT st.student_transaction_code AS code, s.nis, sg.fullname, st.amount, sg.grade, sg.sub_grade,
				-- Legacy leaves the order to the planner; the pivot id keeps it stable (payment order)
				STRING_AGG(si.name, ', ' ORDER BY sit.id) AS description,
				${localTimestamp("st.paid_at")} AS paid_at, ${localTimestamp("st.created_at")} AS created_at
			${DETAIL_FROM} ${where} ${DETAIL_GROUP_BY}
			ORDER BY ${order}, st.id ASC ${pageClause(paging, params)}`,
			params.values,
		)
		return rows.map((row) => ({
			code: String(row.code ?? ""),
			paidAt: (row.paid_at as string | null) ?? null,
			createdAt: (row.created_at as string | null) ?? null,
			fullname: (row.fullname as string | null) ?? null,
			nis: (row.nis as string | null) ?? null,
			amount: toNumber(row.amount),
			description: (row.description as string | null) ?? "",
			grade: toNullableNumber(row.grade),
			subGrade: (row.sub_grade as string | null) ?? null,
		}))
	}

	private async arrearRows(
		filter: ArrearFilter,
		sort: Pick<ArrearQuery, "sortBy" | "sortDir"> | Record<string, never>,
		paging: Paging,
	): Promise<ArrearRow[]> {
		const params = new SqlParams()
		const where = arrearWhere(filter, params)
		// Legacy sends no order by default; invoice id keeps pages stable
		const order = "sortBy" in sort && sort.sortBy ? `${ARREAR_SORT[sort.sortBy]} ${sort.sortDir.toUpperCase()}, ` : ""
		const rows = await this.dataSource.query<Record<string, unknown>[]>(
			`SELECT si.id, s.nis, sg.fullname, si.name, ${ARREAR_FINAL_AMOUNT} AS final_amount,
				to_char(si.due_date, 'YYYY-MM-DD') AS due_date, si.due_date_grade, si.due_date_sub_grade
			${ARREAR_FROM} ${where}
			ORDER BY ${order}si.id ASC ${pageClause(paging, params)}`,
			params.values,
		)
		return rows.map((row) => ({
			id: toNumber(row.id),
			nis: (row.nis as string | null) ?? null,
			fullname: (row.fullname as string | null) ?? null,
			name: (row.name as string | null) ?? null,
			amount: toNumber(row.final_amount),
			dueDate: (row.due_date as string | null) ?? null,
			grade: (row.due_date_grade as string | null) ?? null,
			subGrade: (row.due_date_sub_grade as string | null) ?? null,
		}))
	}
}
