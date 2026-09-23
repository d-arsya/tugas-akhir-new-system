import type { AuthUser } from "./auth"

export interface BannedIpItem {
	id: number
	ipAddress: string
	reason: string
	bannedBy: string
	createdAt: string
}

export interface AcademicYearItem {
	id: number
	year: string // e.g. "2024/2025"
	semester: "GANJIL" | "GENAP"
	isCurrent: boolean
	startDate: string
	endDate: string
	status: "ACTIVE" | "INACTIVE" | "ARCHIVED"
	studentCount?: number
}

export interface LevelItem {
	id: number
	code: string // e.g. "TSA", "ALI"
	name: string // e.g. "Tsanawiyah", "Aliyah"
	levelNumber: number // e.g. 7, 10
	description?: string
	academicYearIds: number[]
	majorIds: number[]
}

export interface MajorItem {
	id: number
	code: string // e.g. "IPA", "IPS", "AGM"
	name: string // e.g. "Ilmu Pengetahuan Alam"
	description?: string
}

export interface SubGradeItem {
	id: number
	gradeId: number
	name: string // e.g. "A", "B", "1"
	capacity: number
	studentCount: number
}

export interface GradeItem {
	id: number
	levelId: number
	levelName?: string
	name: string // e.g. "Kelas 7", "Kelas 10"
	code: string // e.g. "7", "10"
	subGrades: SubGradeItem[]
}

// Request DTOs
export interface CreateBannedIpDto {
	ipAddress: string
	reason: string
}


export interface CreateAcademicYearDto {
	year: string
	semester: "GANJIL" | "GENAP"
	startDate: string
	endDate: string
	isCurrent?: boolean
}

export interface CreateLevelDto {
	code: string
	name: string
	levelNumber: number
	description?: string
	majorIds?: number[]
}

export interface CreateMajorDto {
	code: string
	name: string
	description?: string
}

export interface CreateGradeDto {
	levelId: number
	name: string
	code: string
}

export interface CreateSubGradeDto {
	gradeId: number
	name: string
	capacity: number
}

// Sprint C: Student & Financial Billing Types
export interface StudentItem {
	id: number
	nis: string
	nisn: string
	fullName: string
	gender: "L" | "P"
	pob: string
	dob: string
	phone: string
	gradeName: string
	subGradeName: string
	academicYear: string
	status: "ACTIVE" | "INACTIVE" | "ALUMNI" | "SUSPENDED"
	createdAt: string
	address?: string
	fatherName?: string
	motherName?: string
	guardianName?: string
	healthNotes?: string
}

export interface StudentCapabilityItem {
	id: number
	code: string
	name: string
	amount: number
	termName: string
	assignedStudentsCount: number
}

export interface StudentInvoiceItem {
	id: number
	invoiceNumber: string
	studentId: number
	studentName: string
	gradeName: string
	costTermName: string
	amount: number
	paidAmount: number
	status: "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED"
	dueDate: string
	createdAt: string
	transactions?: Array<{
		id: number
		amount: number
		paymentMethod: string
		paidAt: string
		recordedBy: string
	}>
}

export interface AlumniItem {
	id: number
	studentId: number
	nis: string
	fullName: string
	graduationYear: string
	destination: string
	phone: string
}

// Sprint D: Registrant Admin (PSB) Types
export interface AdminRegistrantItem {
	id: number
	registrationNumber: string
	fullName: string
	gender: "L" | "P"
	chosenLevel: string
	chosenMajor: string
	email: string
	phone: string
	status: "PENDING" | "ACCEPTED" | "REJECTED" | "INVALID"
	rejectionReason?: string
	registeredAt: string
}

// Sprint E: E-Wallet & Cashier Workbench Types
export interface AdminEwalletItem {
	id: number
	accountNumber: string
	ownerName: string
	ownerType: "SANTRI" | "MERCHANT"
	balance: number
	status: "ACTIVE" | "BLOCKED" | "INACTIVE"
	lastTransactionAt?: string
}

export interface BankTransferConfirmationItem {
	id: number
	ewalletAccountId: number
	ownerName: string
	bankName: string
	accountHolder: string
	amount: number
	proofImageUrl: string
	requestedAt: string
	status: "PENDING" | "APPROVED" | "REJECTED"
}

export interface WithdrawalRequestItem {
	id: number
	ewalletAccountId: number
	ownerName: string
	amount: number
	cashierName?: string
	status: "PENDING" | "APPROVED" | "REJECTED"
	requestedAt: string
}

export interface AdminMerchantItem {
	id: number
	businessName: string
	ownerName: string
	email: string
	phone: string
	qrCodePayload: string
	isActive: boolean
	createdAt: string
}

export interface CreateStudentDto {
	nis: string
	nisn: string
	fullName: string
	gender: "L" | "P"
	pob: string
	dob: string
	phone: string
	gradeName: string
	subGradeName: string
	academicYear: string
}

export interface StudentBulkPromoteDto {
	studentIds: number[]
	targetAcademicYearId: number
	targetGradeId: number
	targetSubGradeId: number
}

export interface StudentBulkRetainDto {
	studentIds: number[]
	targetAcademicYearId: number
	targetSubGradeId: number
}

export interface StudentBulkChangeSubGradeDto {
	studentIds: number[]
	targetSubGradeId: number
}

export interface StudentBulkChangeMajorDto {
	studentIds: number[]
	targetMajorId: number
}

export interface StudentBulkStatusDto {
	studentIds: number[]
	status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "MUTASI" | "DO"
	reason?: string
}

export interface StudentBulkGraduateDto {
	studentIds: number[]
	graduationYear: string
	destination?: string
}

export interface StudentCostItem {
	id: number
	name: string
	code: string
	category: string
	amount: number
	academicYearId: number
	academicYearName: string
	gradeId: number
	gradeName: string
	billingCycle: "ONCE" | "MONTHLY" | "YEARLY"
	isActive: boolean
}

export interface CreateStudentCostDto {
	name: string
	code: string
	category: string
	amount: number
	academicYearId: number
	gradeId: number
	billingCycle: "ONCE" | "MONTHLY" | "YEARLY"
	isActive?: boolean
}

export interface StudentCapabilityMatrixItem {
	studentId: number
	nis: string
	fullName: string
	gradeName: string
	capabilities: Array<{
		costItemId: number
		costName: string
		nominal: number
		discountPercent: number
		finalAmount: number
	}>
}

export interface UpdateStudentCapabilityDto {
	studentId: number
	costItemId: number
	discountPercent: number
}

export interface StudentTransactionItem {
	id: number
	transactionNumber: string
	invoiceNumber: string
	studentName: string
	nis: string
	gradeName: string
	amount: number
	paymentMethod: "CASH" | "TRANSFER" | "EWALLET"
	cashierName: string
	paidAt: string
	notes?: string
}

export interface RegistrantDetailItem extends AdminRegistrantItem {
	nik?: string
	nisn?: string
	pob?: string
	dob?: string
	address?: string
	fatherName?: string
	fatherJob?: string
	fatherPhone?: string
	motherName?: string
	motherJob?: string
	motherPhone?: string
	guardianName?: string
	previousSchool?: string
	previousSchoolAddress?: string
	averageScore?: number
	documents?: Array<{
		name: string
		type: string
		fileUrl: string
		isVerified: boolean
	}>
}

export interface TopupEwalletDto {
	ewalletAccountId: number
	amount: number
	notes?: string
}

export interface WithdrawEwalletDto {
	ewalletAccountId: number
	amount: number
	notes?: string
}

export interface BulkGenerateInvoiceDto {

	gradeName: string
	costTermName: string
	dueDate: string
}

export interface AddInvoiceTransactionDto {
	amount: number
	paymentMethod: string
	notes?: string
}

export interface CreateMerchantDto {
	businessName: string
	ownerName: string
	email: string
	phone: string
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
