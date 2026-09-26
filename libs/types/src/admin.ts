export interface BannedIpItem {
	id: number
	ipAddress: string
	reason: string
	bannedBy: string
	createdAt: string
}

// Request DTOs
export interface CreateBannedIpDto {
	ipAddress: string
	reason: string
}

// ── Reports / Laporan (legacy ReportController + ReportArrearController port) ──

export type ReportOptions = {
	academicYears: string[]
	grades: number[]
	subGrades: string[]
	// Student-cost accountancy names (the legacy "Nama Biaya" filter value is the name)
	accountancies: string[]
}

// Legacy query params; dates are bootstrap-datepicker dd/mm/yyyy strings
export type ReportFilterParams = {
	from?: string | undefined
	to?: string | undefined
	academicYear?: string | undefined
	grade?: string | undefined
	subGrade?: string | undefined
	search?: string | undefined
}

export type ReportArrearFilterParams = ReportFilterParams & { accountancy?: string | undefined }

export type ReportTableParams = {
	page: number
	limit: number
	sortBy?: string | undefined
	sortDir?: "asc" | "desc" | undefined
}

export type ReportIncomeDetailRow = {
	code: string
	// Local (Asia/Jakarta) timestamps, yyyy-mm-ddThh:mm:ss
	paidAt: string | null
	createdAt: string | null
	fullname: string | null
	nis: string | null
	amount: number
	description: string
	grade: number | null
	subGrade: string | null
}

export type ReportPageMeta = { page: number; limit: number; total: number; totalPages: number }

export type ReportIncomeDetailPage = {
	data: ReportIncomeDetailRow[]
	meta: ReportPageMeta & { totalIncome: number }
}

export type ReportIncomeRecap = {
	rows: { accName: string; totalAmount: number }[]
	totalAmount: number
	totalData: number
}

export type ReportArrearRow = {
	id: number
	nis: string | null
	fullname: string | null
	name: string | null
	amount: number
	dueDate: string | null
	grade: string | null
	subGrade: string | null
}

export type ReportArrearPage = {
	data: ReportArrearRow[]
	meta: ReportPageMeta & { totalArrear: number }
}

export type ReportExportKind = "income-detail" | "income-recap" | "arrears"

// ── Dashboard (legacy DashboardController port) ──────────────────────────────

export type DashboardStats = {
	total: number
	approve: number
	reject: number
}

export type DashboardOptions = {
	academicYears: { id: number; year: string }[]
	grades: { label: number }[]
}

export type DashboardChartItem = {
	category: string
	value: number
}

export type DashboardPieItem = {
	grade: string
	value: number
}
