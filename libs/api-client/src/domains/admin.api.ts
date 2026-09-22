import type { AxiosInstance } from "axios"
import type {
	ApiResponse,
	PaginatedResponse,
	AdminUserItem,
	AuthLogItem,
	BannedIpItem,
	SettingSchoolData,
	SettingAnnouncementItem,
	SettingFormConfig,
	AcademicYearItem,
	LevelItem,
	MajorItem,
	GradeItem,
	SubGradeItem,
	CreateAdminUserDto,
	UpdateAdminUserDto,
	CreateBannedIpDto,
	CreateAnnouncementDto,
	CreateAcademicYearDto,
	CreateLevelDto,
	CreateMajorDto,
	CreateGradeDto,
	CreateSubGradeDto,
	StudentItem,
	StudentCapabilityItem,
	StudentInvoiceItem,
	AlumniItem,
	AdminRegistrantItem,
	AdminEwalletItem,
	BankTransferConfirmationItem,
	WithdrawalRequestItem,
	AdminMerchantItem,
	CreateStudentDto,
	StudentBulkPromoteDto,
	StudentBulkRetainDto,
	StudentBulkChangeSubGradeDto,
	StudentBulkChangeMajorDto,
	StudentBulkStatusDto,
	StudentBulkGraduateDto,
	StudentCostItem,
	CreateStudentCostDto,
	StudentCapabilityMatrixItem,
	UpdateStudentCapabilityDto,
	StudentTransactionItem,
	TopupEwalletDto,
	WithdrawEwalletDto,
	BulkGenerateInvoiceDto,
	AddInvoiceTransactionDto,
	CreateMerchantDto,
	ReportArrearItem,
	ReportArrearsFilterParams,
	ReportArrearsAgingSummary,
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

export interface AdminApi {
	// Auth
	login(data: AdminLoginDto): Promise<AdminLoginResponse>
	verify2fa(code: string, adminId: number): Promise<AdminLoginResponse>
	resend2fa(adminId: number): Promise<{ message: string }>
	forgotPassword(email: string): Promise<{ message: string }>
	resetPassword(token: string, password: string): Promise<{ message: string }>
	logout(): Promise<{ message: string }>
	getMyProfile(): Promise<AdminUserItem>
	updateMyProfile(data: Partial<AdminUserItem>): Promise<{ message: string }>
	changePassword(password: string, newPassword: string): Promise<{ message: string }>

	// Users & Security
	getUsers(params?: { search?: string | undefined; role?: string | undefined; page?: number | undefined; limit?: number | undefined }): Promise<PaginatedResponse<AdminUserItem>>
	createUser(data: CreateAdminUserDto): Promise<ApiResponse<AdminUserItem>>
	updateUser(id: number, data: UpdateAdminUserDto): Promise<ApiResponse<AdminUserItem>>
	toggleUserStatus(id: number, isActive: boolean): Promise<ApiResponse<{ message: string }>>
	getAuthLogs(params?: { search?: string | undefined; page?: number | undefined; limit?: number | undefined }): Promise<PaginatedResponse<AuthLogItem>>
	getBannedIps(params?: { search?: string | undefined; page?: number | undefined; limit?: number | undefined }): Promise<PaginatedResponse<BannedIpItem>>
	createBannedIp(data: CreateBannedIpDto): Promise<ApiResponse<BannedIpItem>>
	deleteBannedIp(id: number): Promise<ApiResponse<{ message: string }>>

	// System Settings
	getSchoolSettings(): Promise<ApiResponse<SettingSchoolData>>
	updateSchoolSettings(data: SettingSchoolData): Promise<ApiResponse<{ message: string }>>
	getAnnouncements(): Promise<ApiResponse<SettingAnnouncementItem[]>>
	createAnnouncement(data: CreateAnnouncementDto): Promise<ApiResponse<SettingAnnouncementItem>>
	updateAnnouncement(id: number, data: Partial<CreateAnnouncementDto>): Promise<ApiResponse<SettingAnnouncementItem>>
	deleteAnnouncement(id: number): Promise<ApiResponse<{ message: string }>>
	getFormConfig(): Promise<ApiResponse<SettingFormConfig>>
	updateFormConfig(data: Partial<SettingFormConfig>): Promise<ApiResponse<{ message: string }>>
	toggle2faSystem(enabled: boolean): Promise<ApiResponse<{ message: string }>>

	// Academic Structure (Sprint B)
	getAcademicYears(): Promise<ApiResponse<AcademicYearItem[]>>
	createAcademicYear(data: CreateAcademicYearDto): Promise<ApiResponse<AcademicYearItem>>
	updateAcademicYear(id: number, data: Partial<CreateAcademicYearDto>): Promise<ApiResponse<AcademicYearItem>>
	setActiveAcademicYear(id: number): Promise<ApiResponse<{ message: string }>>

	getLevels(): Promise<ApiResponse<LevelItem[]>>
	createLevel(data: CreateLevelDto): Promise<ApiResponse<LevelItem>>
	updateLevel(id: number, data: Partial<CreateLevelDto>): Promise<ApiResponse<LevelItem>>
	deleteLevel(id: number): Promise<ApiResponse<{ message: string }>>

	getMajors(): Promise<ApiResponse<MajorItem[]>>
	createMajor(data: CreateMajorDto): Promise<ApiResponse<MajorItem>>
	updateMajor(id: number, data: Partial<CreateMajorDto>): Promise<ApiResponse<MajorItem>>
	deleteMajor(id: number): Promise<ApiResponse<{ message: string }>>

	getGrades(): Promise<ApiResponse<GradeItem[]>>
	createGrade(data: CreateGradeDto): Promise<ApiResponse<GradeItem>>
	updateGrade(id: number, data: Partial<CreateGradeDto>): Promise<ApiResponse<GradeItem>>
	deleteGrade(id: number): Promise<ApiResponse<{ message: string }>>

	createSubGrade(data: CreateSubGradeDto): Promise<ApiResponse<SubGradeItem>>
	updateSubGrade(id: number, data: Partial<CreateSubGradeDto>): Promise<ApiResponse<SubGradeItem>>
	deleteSubGrade(id: number): Promise<ApiResponse<{ message: string }>>

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
	
	// Student Costs (Tarif per Akun)
	getStudentCosts(params?: { academicYearId?: number; gradeId?: number }): Promise<ApiResponse<StudentCostItem[]>>
	createStudentCost(data: CreateStudentCostDto): Promise<ApiResponse<StudentCostItem>>
	updateStudentCost(id: number, data: Partial<CreateStudentCostDto>): Promise<ApiResponse<StudentCostItem>>
	deleteStudentCost(id: number): Promise<ApiResponse<{ message: string }>>

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

	getMerchants(params?: { search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<AdminMerchantItem>>
	createMerchant(data: CreateMerchantDto): Promise<ApiResponse<AdminMerchantItem>>
	toggleMerchantStatus(id: number, isActive: boolean): Promise<ApiResponse<{ message: string }>>

	// Analytics & Reports
	getDashboardStats(params?: { academicYearId?: number | undefined }): Promise<DashboardStats>
	getDashboardOptions(): Promise<DashboardOptions>
	getDashboardChartStudent(params: { grade: number }): Promise<DashboardChartItem[]>
	getDashboardPieChart(): Promise<DashboardPieItem[]>
	getReportsIncome(params?: ReportIncomeFilterParams): Promise<ReportIncomeItem[]>
	getReportsIncomeRecap(params?: ReportIncomeFilterParams): Promise<ReportIncomeRecapItem[]>
	getReportsArrears(params?: ReportArrearsFilterParams): Promise<PaginatedResponse<ReportArrearItem>>
	getReportsArrearsAging(params?: ReportArrearsFilterParams): Promise<ReportArrearsAgingSummary>
	getAccountancyTree(): Promise<any[]>
}

const unwrap = <T>(promise: Promise<any>): Promise<T> =>
	promise.then((r) => {
		const body = r.data
		if (body && typeof body === "object" && "data" in body && body.data !== undefined) {
			return body.data
		}
		return body
	})

export const createAdminApi = (client: AxiosInstance): AdminApi => ({
	login: (data) => unwrap(client.post("/admin/auth/login", data)),
	verify2fa: (code, adminId) => unwrap(client.post("/admin/auth/2fa/verify", { code, adminId })),
	resend2fa: (adminId) => unwrap(client.post(`/admin/auth/2fa/resend/${adminId}`)),
	forgotPassword: (email) => unwrap(client.post("/admin/auth/forgot-password", { email })),
	resetPassword: (token, password) => unwrap(client.post("/admin/auth/reset-password", { token, password })),
	logout: () => unwrap(client.post("/admin/auth/logout")),
	getMyProfile: () => unwrap(client.get("/admin/profile")),
	updateMyProfile: (data) => unwrap(client.patch("/admin/profile", data)),
	changePassword: (password, newPassword) => unwrap(client.patch("/admin/profile/password", { password, newPassword })),

	getDashboardStats: (params) => unwrap(client.get("/admin/dashboard/stats", { params })),
	getDashboardOptions: () => unwrap(client.get("/admin/dashboard/options")),
	getDashboardChartStudent: (params) => unwrap(client.get("/admin/dashboard/chart-student", { params })),
	getDashboardPieChart: () => unwrap(client.get("/admin/dashboard/pie-chart")),
	getReportsIncome: (params) => unwrap(client.get("/admin/billing/reports/income", { params })),
	getReportsIncomeRecap: (params) => unwrap(client.get("/admin/billing/reports/income/recap", { params })),
	getReportsArrears: (params) => unwrap(client.get("/admin/billing/reports/arrears", { params })),
	getReportsArrearsAging: (params) => unwrap(client.get("/admin/billing/reports/arrears/aging", { params })),
	getAccountancyTree: () => unwrap(client.get("/admin/billing/accounts")),

	getUsers: (params) => unwrap(client.get("/admin/users", { params })),
	createUser: (data) => unwrap(client.post("/admin/users", data)),
	updateUser: (id, data) => unwrap(client.patch(`/admin/users/${id}`, data)),
	toggleUserStatus: (id, isActive) => unwrap(client.patch(`/admin/users/${id}/status`, { isActive })),
	getAuthLogs: (params) => unwrap(client.get("/admin/auth-logs", { params })),
	getBannedIps: (params) => unwrap(client.get("/admin/ip-bans", { params })),
	createBannedIp: (data) => unwrap(client.post("/admin/ip-bans", data)),
	deleteBannedIp: (id) => unwrap(client.delete(`/admin/ip-bans/${id}`)),

	getSchoolSettings: () => unwrap(client.get("/admin/settings/school")),
	updateSchoolSettings: (data) => unwrap(client.patch("/admin/settings/school", data)),
	getAnnouncements: () => unwrap(client.get("/admin/settings/announcements")),
	createAnnouncement: (data) => unwrap(client.post("/admin/settings/announcements", data)),
	updateAnnouncement: (id, data) => unwrap(client.patch(`/admin/settings/announcements/${id}`, data)),
	deleteAnnouncement: (id) => unwrap(client.delete(`/admin/settings/announcements/${id}`)),
	getFormConfig: () => unwrap(client.get("/admin/settings/form")),
	updateFormConfig: (data) => unwrap(client.patch("/admin/settings/form", data)),
	toggle2faSystem: (enabled) => unwrap(client.patch("/admin/settings/2fa", { enabled })),

	getAcademicYears: () => unwrap(client.get("/admin/academic-years")),
	createAcademicYear: (data) => unwrap(client.post("/admin/academic-years", data)),
	updateAcademicYear: (id, data) => unwrap(client.patch(`/admin/academic-years/${id}`, data)),
	setActiveAcademicYear: (id) => unwrap(client.patch(`/admin/academic-years/${id}/set-active`)),

	getLevels: () => unwrap(client.get("/admin/levels")),
	createLevel: (data) => unwrap(client.post("/admin/levels", data)),
	updateLevel: (id, data) => unwrap(client.patch(`/admin/levels/${id}`, data)),
	deleteLevel: (id) => unwrap(client.delete(`/admin/levels/${id}`)),

	getMajors: () => unwrap(client.get("/admin/majors")),
	createMajor: (data) => unwrap(client.post("/admin/majors", data)),
	updateMajor: (id, data) => unwrap(client.patch(`/admin/majors/${id}`, data)),
	deleteMajor: (id) => unwrap(client.delete(`/admin/majors/${id}`)),

	getGrades: () => unwrap(client.get("/admin/grades")),
	createGrade: (data) => unwrap(client.post("/admin/grades", data)),
	updateGrade: (id, data) => unwrap(client.patch(`/admin/grades/${id}`, data)),
	deleteGrade: (id) => unwrap(client.delete(`/admin/grades/${id}`)),

	createSubGrade: (data) => unwrap(client.post("/admin/sub-grades", data)),
	updateSubGrade: (id, data) => unwrap(client.patch(`/admin/sub-grades/${id}`, data)),
	deleteSubGrade: (id) => unwrap(client.delete(`/admin/sub-grades/${id}`)),

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
	
	getStudentCosts: (params) => unwrap(client.get("/admin/student-costs", { params })),
	createStudentCost: (data) => unwrap(client.post("/admin/student-costs", data)),
	updateStudentCost: (id, data) => unwrap(client.patch(`/admin/student-costs/${id}`, data)),
	deleteStudentCost: (id) => unwrap(client.delete(`/admin/student-costs/${id}`)),

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

	getMerchants: (params) => unwrap(client.get("/admin/merchants", { params })),
	createMerchant: (data) => unwrap(client.post("/admin/merchants", data)),
	toggleMerchantStatus: (id, isActive) => unwrap(client.patch(`/admin/merchants/${id}/status`, { isActive })),
})


