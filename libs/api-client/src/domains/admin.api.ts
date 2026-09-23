import type { AxiosInstance } from "axios"

import { createAdminLainnyaApi, type AdminLainnyaApi } from "./admin-lainnya.api"
import { createAdminMasterApi, type AdminMasterApi } from "./admin-master.api"
import { createAdminMasterFinanceApi, type AdminMasterFinanceApi } from "./admin-master-finance.api"
import type {
	ApiResponse,
	PaginatedResponse,
	BannedIpItem,
	CreateBannedIpDto,
	StudentItem,
	StudentCapabilityItem,
	StudentInvoiceItem,
	AlumniItem,
	AdminRegistrantItem,
	AdminEwalletItem,
	BankTransferConfirmationItem,
	WithdrawalRequestItem,
	CreateStudentDto,
	StudentBulkPromoteDto,
	StudentBulkRetainDto,
	StudentBulkChangeSubGradeDto,
	StudentBulkChangeMajorDto,
	StudentBulkStatusDto,
	StudentBulkGraduateDto,
	StudentCapabilityMatrixItem,
	UpdateStudentCapabilityDto,
	StudentTransactionItem,
	TopupEwalletDto,
	WithdrawEwalletDto,
	BulkGenerateInvoiceDto,
	AddInvoiceTransactionDto,
	ReportOptions,
	ReportFilterParams,
	ReportArrearFilterParams,
	ReportTableParams,
	ReportIncomeDetailPage,
	ReportIncomeRecap,
	ReportArrearPage,
	ReportExportKind,
	DashboardStats,
	DashboardOptions,
	DashboardChartItem,
	DashboardPieItem,
} from "@roja/types"

export interface AdminLoginDto {
	email: string
	password?: string
}

export interface AdminLoginResponse {
	requires2fa: boolean
	adminId?: number
	email?: string
	accessToken?: string
	refreshToken?: string
	user?: any
}

export interface AdminApi extends AdminLainnyaApi, AdminMasterApi, AdminMasterFinanceApi {
	// Auth
	login(data: AdminLoginDto): Promise<AdminLoginResponse>
	verify2fa(code: string, adminId: number): Promise<AdminLoginResponse>
	resend2fa(adminId: number): Promise<{ message: string }>
	forgotPassword(email: string): Promise<{ message: string }>
	resetPassword(token: string, password: string): Promise<{ message: string }>
	logout(): Promise<{ message: string }>

	// IP bans
	getBannedIps(params?: { search?: string | undefined; page?: number | undefined; limit?: number | undefined }): Promise<PaginatedResponse<BannedIpItem>>
	createBannedIp(data: CreateBannedIpDto): Promise<ApiResponse<BannedIpItem>>
	deleteBannedIp(id: number): Promise<ApiResponse<{ message: string }>>

	// Sprint C: Student Management & Financial Billing
	getStudents(params?: { search?: string; grade?: string; status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<StudentItem>>
	getStudentById(id: number): Promise<ApiResponse<StudentItem>>
	createStudent(data: CreateStudentDto): Promise<ApiResponse<StudentItem>>
	updateStudent(id: number, data: Partial<CreateStudentDto>): Promise<ApiResponse<StudentItem>>
	bulkPromoteStudents(data: StudentBulkPromoteDto): Promise<ApiResponse<{ count: number }>>
	bulkRetainStudents(data: StudentBulkRetainDto): Promise<ApiResponse<{ count: number }>>
	bulkChangeSubGrade(data: StudentBulkChangeSubGradeDto): Promise<ApiResponse<{ count: number }>>
	bulkChangeMajor(data: StudentBulkChangeMajorDto): Promise<ApiResponse<{ count: number }>>
	bulkChangeStatus(data: StudentBulkStatusDto): Promise<ApiResponse<{ count: number }>>
	bulkGraduateStudents(data: StudentBulkGraduateDto): Promise<ApiResponse<{ count: number }>>

	// Student Capability & Invoices
	getCapabilities(): Promise<ApiResponse<StudentCapabilityItem[]>>
	getStudentCapabilityMatrix(params?: { academicYearId?: number; gradeId?: number }): Promise<ApiResponse<StudentCapabilityMatrixItem[]>>
	updateStudentCapability(data: UpdateStudentCapabilityDto): Promise<ApiResponse<{ message: string }>>
	getInvoices(params?: { search?: string; status?: string; grade?: string; page?: number; limit?: number }): Promise<PaginatedResponse<StudentInvoiceItem>>
	bulkGenerateInvoices(data: BulkGenerateInvoiceDto): Promise<ApiResponse<{ generatedCount: number }>>
	addInvoiceTransaction(invoiceId: number, data: AddInvoiceTransactionDto): Promise<ApiResponse<StudentInvoiceItem>>
	getStudentTransactions(params?: { search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<StudentTransactionItem>>
	getAlumni(params?: { search?: string; year?: string; page?: number; limit?: number }): Promise<PaginatedResponse<AlumniItem>>

	// Sprint D: Registrant Admin (PSB)
	getRegistrants(params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<AdminRegistrantItem>>
	getRegistrantById(id: number): Promise<ApiResponse<AdminRegistrantItem>>
	acceptRegistrant(id: number): Promise<ApiResponse<{ message: string }>>
	rejectRegistrant(id: number, reason: string): Promise<ApiResponse<{ message: string }>>
	markRegistrantInvalid(id: number, note: string): Promise<ApiResponse<{ message: string }>>

	// Sprint E: E-Wallet, Cashier & Merchant Operations
	getEwallets(params?: { search?: string; type?: string; page?: number; limit?: number }): Promise<PaginatedResponse<AdminEwalletItem>>
	topUpEwalletCash(id: number, amount: number): Promise<ApiResponse<{ message: string }>>
	withdrawEwalletCash(data: WithdrawEwalletDto): Promise<ApiResponse<{ message: string }>>
	resetEwalletPin(id: number): Promise<ApiResponse<{ message: string }>>
	
	getBankTransferConfirmations(params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<BankTransferConfirmationItem>>
	approveBankTransfer(id: number): Promise<ApiResponse<{ message: string }>>
	rejectBankTransfer(id: number, reason: string): Promise<ApiResponse<{ message: string }>>
	
	getWithdrawalRequests(params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<WithdrawalRequestItem>>
	approveWithdrawal(id: number): Promise<ApiResponse<{ message: string }>>
	rejectWithdrawal(id: number, reason: string): Promise<ApiResponse<{ message: string }>>


	// Analytics & Reports
	getDashboardStats(params?: { academicYearId?: number | undefined }): Promise<DashboardStats>
	getDashboardOptions(): Promise<DashboardOptions>
	getDashboardChartStudent(params: { grade: number }): Promise<DashboardChartItem[]>
	getDashboardPieChart(): Promise<DashboardPieItem[]>
	getReportOptions(): Promise<ReportOptions>
	getReportIncomeDetail(params: ReportFilterParams & ReportTableParams): Promise<ReportIncomeDetailPage>
	getReportIncomeRecap(params: ReportFilterParams): Promise<ReportIncomeRecap>
	getReportArrears(params: ReportArrearFilterParams & ReportTableParams): Promise<ReportArrearPage>
	downloadReport(kind: ReportExportKind, params: ReportArrearFilterParams): Promise<{ blob: Blob; fileName: string | null }>
}

const unwrap = <T>(promise: Promise<any>): Promise<T> =>
	promise.then((r) => {
		const body = r.data
		if (body && typeof body === "object" && "data" in body && body.data !== undefined) {
			return body.data
		}
		return body
	})

// Paginated endpoints: keep the envelope's meta next to the rows
const unwrapPage = <T>(promise: Promise<any>): Promise<T> =>
	promise.then((r) => ({ data: r.data?.data ?? [], meta: r.data?.meta }) as T)

const REPORT_EXPORT_PATHS: Record<ReportExportKind, string> = {
	"income-detail": "/admin/reports/income/detail/export",
	"income-recap": "/admin/reports/income/recap/export",
	arrears: "/admin/reports/arrears/export",
}

// RFC 6266: prefer filename* (UTF-8), fall back to the quoted filename
const fileNameFromDisposition = (header: string | undefined): string | null => {
	if (!header) return null
	const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)?.[1]
	if (encoded) return decodeURIComponent(encoded)
	return /filename="([^"]+)"/i.exec(header)?.[1] ?? null
}

export const createAdminApi = (client: AxiosInstance): AdminApi => ({
	...createAdminLainnyaApi(client),
	...createAdminMasterApi(client),
	...createAdminMasterFinanceApi(client),

	login: (data) => unwrap(client.post("/admin/auth/login", data)),
	verify2fa: (code, adminId) => unwrap(client.post("/admin/auth/2fa/verify", { code, adminId })),
	resend2fa: (adminId) => unwrap(client.post(`/admin/auth/2fa/resend/${adminId}`)),
	forgotPassword: (email) => unwrap(client.post("/admin/auth/forgot-password", { email })),
	resetPassword: (token, password) => unwrap(client.post("/admin/auth/reset-password", { token, password })),
	logout: () => unwrap(client.post("/admin/auth/logout")),

	getDashboardStats: (params) => unwrap(client.get("/admin/dashboard/stats", { params })),
	getDashboardOptions: () => unwrap(client.get("/admin/dashboard/options")),
	getDashboardChartStudent: (params) => unwrap(client.get("/admin/dashboard/chart-student", { params })),
	getDashboardPieChart: () => unwrap(client.get("/admin/dashboard/pie-chart")),
	getReportOptions: () => unwrap(client.get("/admin/reports/options")),
	getReportIncomeDetail: (params) => unwrapPage(client.get("/admin/reports/income/detail", { params })),
	getReportIncomeRecap: (params) => unwrap(client.get("/admin/reports/income/recap", { params })),
	getReportArrears: (params) => unwrapPage(client.get("/admin/reports/arrears", { params })),
	downloadReport: (kind, params) =>
		client.get<Blob>(REPORT_EXPORT_PATHS[kind], { params, responseType: "blob" }).then((r) => ({
			blob: r.data,
			fileName: fileNameFromDisposition(r.headers["content-disposition"] as string | undefined),
		})),

	getBannedIps: (params) => unwrap(client.get("/admin/ip-bans", { params })),
	createBannedIp: (data) => unwrap(client.post("/admin/ip-bans", data)),
	deleteBannedIp: (id) => unwrap(client.delete(`/admin/ip-bans/${id}`)),


	getStudents: (params) => unwrap(client.get("/admin/students", { params })),
	getStudentById: (id) => unwrap(client.get(`/admin/students/${id}`)),
	createStudent: (data) => unwrap(client.post("/admin/students", data)),
	updateStudent: (id, data) => unwrap(client.patch(`/admin/students/${id}`, data)),
	bulkPromoteStudents: (data) => unwrap(client.post("/admin/students/bulk-promote", data)),
	bulkRetainStudents: (data) => unwrap(client.post("/admin/students/bulk-retain", data)),
	bulkChangeSubGrade: (data) => unwrap(client.post("/admin/students/bulk-change-subgrade", data)),
	bulkChangeMajor: (data) => unwrap(client.post("/admin/students/bulk-change-major", data)),
	bulkChangeStatus: (data) => unwrap(client.post("/admin/students/bulk-change-status", data)),
	bulkGraduateStudents: (data) => unwrap(client.post("/admin/students/bulk-graduate", data)),
	

	getCapabilities: () => unwrap(client.get("/admin/capabilities")),
	getStudentCapabilityMatrix: (params) => unwrap(client.get("/admin/student-capabilities/matrix", { params })),
	updateStudentCapability: (data) => unwrap(client.post("/admin/student-capabilities/update", data)),
	getInvoices: (params) => unwrap(client.get("/admin/invoices", { params })),
	bulkGenerateInvoices: (data) => unwrap(client.post("/admin/invoices/bulk-generate", data)),
	addInvoiceTransaction: (invoiceId, data) => unwrap(client.post(`/admin/invoices/${invoiceId}/transactions`, data)),
	getStudentTransactions: (params) => unwrap(client.get("/admin/student-transactions", { params })),
	getAlumni: (params) => unwrap(client.get("/admin/alumni", { params })),

	getRegistrants: (params) => unwrap(client.get("/admin/registrants", { params })),
	getRegistrantById: (id) => unwrap(client.get(`/admin/registrants/${id}`)),
	acceptRegistrant: (id) => unwrap(client.patch(`/admin/registrants/${id}/accept`)),
	rejectRegistrant: (id, reason) => unwrap(client.patch(`/admin/registrants/${id}/reject`, { reason })),
	markRegistrantInvalid: (id, note) => unwrap(client.patch(`/admin/registrants/${id}/invalid`, { note })),

	getEwallets: (params) => unwrap(client.get("/admin/ewallets", { params })),
	topUpEwalletCash: (id, amount) => unwrap(client.post(`/admin/ewallets/${id}/top-up-cash`, { amount })),
	withdrawEwalletCash: (data) => unwrap(client.post("/admin/ewallets/withdraw-cash", data)),
	resetEwalletPin: (id) => unwrap(client.post(`/admin/ewallets/${id}/reset-pin`)),

	getBankTransferConfirmations: (params) => unwrap(client.get("/admin/bank-confirmations", { params })),
	approveBankTransfer: (id) => unwrap(client.patch(`/admin/bank-confirmations/${id}/approve`)),
	rejectBankTransfer: (id, reason) => unwrap(client.patch(`/admin/bank-confirmations/${id}/reject`, { reason })),

	getWithdrawalRequests: (params) => unwrap(client.get("/admin/withdrawals", { params })),
	approveWithdrawal: (id) => unwrap(client.patch(`/admin/withdrawals/${id}/approve`)),
	rejectWithdrawal: (id, reason) => unwrap(client.patch(`/admin/withdrawals/${id}/reject`, { reason })),

})


