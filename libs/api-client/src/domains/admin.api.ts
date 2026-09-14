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

	// Dashboard
	getDashboardStats(): Promise<{
		totalStudents: number
		activeAcademicYear: string
		pendingRegistrants: number
		totalEwalletBalance: number
		incomeThisMonth: number
	}>

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
}

export const createAdminApi = (client: AxiosInstance): AdminApi => ({
	login: (data) => client.post("/admin/auth/login", data).then((r) => r.data),
	verify2fa: (code, adminId) => client.post("/admin/auth/2fa/verify", { code, adminId }).then((r) => r.data),
	resend2fa: (adminId) => client.post(`/admin/auth/2fa/resend/${adminId}`).then((r) => r.data),
	forgotPassword: (email) => client.post("/admin/auth/forgot-password", { email }).then((r) => r.data),
	resetPassword: (token, password) => client.post("/admin/auth/reset-password", { token, password }).then((r) => r.data),
	logout: () => client.post("/admin/auth/logout").then((r) => r.data),
	getMyProfile: () => client.get("/admin/profile").then((r) => r.data),
	updateMyProfile: (data) => client.patch("/admin/profile", data).then((r) => r.data),
	changePassword: (password, newPassword) => client.patch("/admin/profile/password", { password, newPassword }).then((r) => r.data),

	getDashboardStats: () => client.get("/admin/dashboard").then((r) => r.data),

	getUsers: (params) => client.get("/admin/users", { params }).then((r) => r.data),
	createUser: (data) => client.post("/admin/users", data).then((r) => r.data),
	updateUser: (id, data) => client.patch(`/admin/users/${id}`, data).then((r) => r.data),
	toggleUserStatus: (id, isActive) => client.patch(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),
	getAuthLogs: (params) => client.get("/admin/auth-logs", { params }).then((r) => r.data),
	getBannedIps: (params) => client.get("/admin/ip-bans", { params }).then((r) => r.data),
	createBannedIp: (data) => client.post("/admin/ip-bans", data).then((r) => r.data),
	deleteBannedIp: (id) => client.delete(`/admin/ip-bans/${id}`).then((r) => r.data),

	getSchoolSettings: () => client.get("/admin/settings/school").then((r) => r.data),
	updateSchoolSettings: (data) => client.patch("/admin/settings/school", data).then((r) => r.data),
	getAnnouncements: () => client.get("/admin/settings/announcements").then((r) => r.data),
	createAnnouncement: (data) => client.post("/admin/settings/announcements", data).then((r) => r.data),
	updateAnnouncement: (id, data) => client.patch(`/admin/settings/announcements/${id}`, data).then((r) => r.data),
	deleteAnnouncement: (id) => client.delete(`/admin/settings/announcements/${id}`).then((r) => r.data),
	getFormConfig: () => client.get("/admin/settings/form").then((r) => r.data),
	updateFormConfig: (data) => client.patch("/admin/settings/form", data).then((r) => r.data),
	toggle2faSystem: (enabled) => client.patch("/admin/settings/2fa", { enabled }).then((r) => r.data),

	getAcademicYears: () => client.get("/admin/academic-years").then((r) => r.data),
	createAcademicYear: (data) => client.post("/admin/academic-years", data).then((r) => r.data),
	updateAcademicYear: (id, data) => client.patch(`/admin/academic-years/${id}`, data).then((r) => r.data),
	setActiveAcademicYear: (id) => client.patch(`/admin/academic-years/${id}/set-active`).then((r) => r.data),

	getLevels: () => client.get("/admin/levels").then((r) => r.data),
	createLevel: (data) => client.post("/admin/levels", data).then((r) => r.data),
	updateLevel: (id, data) => client.patch(`/admin/levels/${id}`, data).then((r) => r.data),
	deleteLevel: (id) => client.delete(`/admin/levels/${id}`).then((r) => r.data),

	getMajors: () => client.get("/admin/majors").then((r) => r.data),
	createMajor: (data) => client.post("/admin/majors", data).then((r) => r.data),
	updateMajor: (id, data) => client.patch(`/admin/majors/${id}`, data).then((r) => r.data),
	deleteMajor: (id) => client.delete(`/admin/majors/${id}`).then((r) => r.data),

	getGrades: () => client.get("/admin/grades").then((r) => r.data),
	createGrade: (data) => client.post("/admin/grades", data).then((r) => r.data),
	updateGrade: (id, data) => client.patch(`/admin/grades/${id}`, data).then((r) => r.data),
	deleteGrade: (id) => client.delete(`/admin/grades/${id}`).then((r) => r.data),

	createSubGrade: (data) => client.post("/admin/sub-grades", data).then((r) => r.data),
	updateSubGrade: (id, data) => client.patch(`/admin/sub-grades/${id}`, data).then((r) => r.data),
	deleteSubGrade: (id) => client.delete(`/admin/sub-grades/${id}`).then((r) => r.data),

	getStudents: (params) => client.get("/admin/students", { params }).then((r) => r.data),
	getStudentById: (id) => client.get(`/admin/students/${id}`).then((r) => r.data),
	createStudent: (data) => client.post("/admin/students", data).then((r) => r.data),
	updateStudent: (id, data) => client.patch(`/admin/students/${id}`, data).then((r) => r.data),
	bulkPromoteStudents: (data) => client.post("/admin/students/bulk-promote", data).then((r) => r.data),
	bulkRetainStudents: (data) => client.post("/admin/students/bulk-retain", data).then((r) => r.data),
	bulkChangeSubGrade: (data) => client.post("/admin/students/bulk-change-subgrade", data).then((r) => r.data),
	bulkChangeMajor: (data) => client.post("/admin/students/bulk-change-major", data).then((r) => r.data),
	bulkChangeStatus: (data) => client.post("/admin/students/bulk-change-status", data).then((r) => r.data),
	bulkGraduateStudents: (data) => client.post("/admin/students/bulk-graduate", data).then((r) => r.data),
	
	getStudentCosts: (params) => client.get("/admin/student-costs", { params }).then((r) => r.data),
	createStudentCost: (data) => client.post("/admin/student-costs", data).then((r) => r.data),
	updateStudentCost: (id, data) => client.patch(`/admin/student-costs/${id}`, data).then((r) => r.data),
	deleteStudentCost: (id) => client.delete(`/admin/student-costs/${id}`).then((r) => r.data),

	getCapabilities: () => client.get("/admin/capabilities").then((r) => r.data),
	getStudentCapabilityMatrix: (params) => client.get("/admin/student-capabilities/matrix", { params }).then((r) => r.data),
	updateStudentCapability: (data) => client.post("/admin/student-capabilities/update", data).then((r) => r.data),
	getInvoices: (params) => client.get("/admin/invoices", { params }).then((r) => r.data),
	bulkGenerateInvoices: (data) => client.post("/admin/invoices/bulk-generate", data).then((r) => r.data),
	addInvoiceTransaction: (invoiceId, data) => client.post(`/admin/invoices/${invoiceId}/transactions`, data).then((r) => r.data),
	getStudentTransactions: (params) => client.get("/admin/student-transactions", { params }).then((r) => r.data),
	getAlumni: (params) => client.get("/admin/alumni", { params }).then((r) => r.data),

	getRegistrants: (params) => client.get("/admin/registrants", { params }).then((r) => r.data),
	getRegistrantById: (id) => client.get(`/admin/registrants/${id}`).then((r) => r.data),
	acceptRegistrant: (id) => client.patch(`/admin/registrants/${id}/accept`).then((r) => r.data),
	rejectRegistrant: (id, reason) => client.patch(`/admin/registrants/${id}/reject`, { reason }).then((r) => r.data),
	markRegistrantInvalid: (id, note) => client.patch(`/admin/registrants/${id}/invalid`, { note }).then((r) => r.data),

	getEwallets: (params) => client.get("/admin/ewallets", { params }).then((r) => r.data),
	topUpEwalletCash: (id, amount) => client.post(`/admin/ewallets/${id}/top-up-cash`, { amount }).then((r) => r.data),
	withdrawEwalletCash: (data) => client.post("/admin/ewallets/withdraw-cash", data).then((r) => r.data),
	resetEwalletPin: (id) => client.post(`/admin/ewallets/${id}/reset-pin`).then((r) => r.data),

	getBankTransferConfirmations: (params) => client.get("/admin/bank-confirmations", { params }).then((r) => r.data),
	approveBankTransfer: (id) => client.patch(`/admin/bank-confirmations/${id}/approve`).then((r) => r.data),
	rejectBankTransfer: (id, reason) => client.patch(`/admin/bank-confirmations/${id}/reject`, { reason }).then((r) => r.data),

	getWithdrawalRequests: (params) => client.get("/admin/withdrawals", { params }).then((r) => r.data),
	approveWithdrawal: (id) => client.patch(`/admin/withdrawals/${id}/approve`).then((r) => r.data),
	rejectWithdrawal: (id, reason) => client.patch(`/admin/withdrawals/${id}/reject`, { reason }).then((r) => r.data),

	getMerchants: (params) => client.get("/admin/merchants", { params }).then((r) => r.data),
	createMerchant: (data) => client.post("/admin/merchants", data).then((r) => r.data),
	toggleMerchantStatus: (id, isActive) => client.patch(`/admin/merchants/${id}/status`, { isActive }).then((r) => r.data),
})


