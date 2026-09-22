import type { AdminApi, AdminLoginDto, AdminLoginResponse } from "@roja/api-client"
import { getRuntimeEnv } from "@roja/utils"
import type {
	AdminUserItem,
	StudentItem,
	StudentCapabilityItem,
	StudentInvoiceItem,
	AlumniItem,
	AdminRegistrantItem,
	AdminEwalletItem,
	BankTransferConfirmationItem,
	WithdrawalRequestItem,
	AdminMerchantItem,
	StudentCostItem,
	StudentCapabilityMatrixItem,
	StudentTransactionItem,
} from "@roja/types"
import {
	hijackAuthUser,
	mockAdminUsers,
	mockAuthLogs,
	mockBannedIps,
	mockSchoolSettings,
	mockAnnouncements,
	mockFormConfig,
	mockAcademicYears,
	mockLevels,
	mockMajors,
	mockGrades,
	mockStudents,
	mockCapabilities,
	mockInvoices,
	mockAlumni,
	mockRegistrants,
	mockEwallets,
	mockBankConfirmations,
	mockWithdrawals,
	mockMerchants,
	mockStudentCosts,
	mockStudentCapabilityMatrix,
	mockStudentTransactions,
	mockDashboardStats,
	mockDashboardStatsByYear,
	mockDashboardOptions,
	mockDashboardChartStudent,
	mockDashboardPie,
} from "./dev-hijack.fixtures"
import {
	mockReportArrears,
	mockReportIncomeDetail,
	mockReportIncomeRecap,
	mockReportOptions,
} from "./dev-hijack.report-fixtures"

export { hijackAuthUser }

export const IS_DEV_HIJACK =
	getRuntimeEnv("VITE_DEV_HIJACK") === "true" ||
	(import.meta.env.DEV && getRuntimeEnv("VITE_DEV_HIJACK") !== "false")

export const isDevHijackMode = (): boolean => IS_DEV_HIJACK

// Legacy export file names (the real API sends them in Content-Disposition)
const REPORT_FILE_NAMES = {
	"income-detail": "Laporan Pembayaran Santri (Rincian).xlsx",
	"income-recap": "Laporan Pembayaran Santri (Rekapitulasi).xlsx",
	arrears: "Laporan Tunggakan Pembayaran Santri.xlsx",
} as const

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

let usersList: AdminUserItem[] = [...mockAdminUsers]
let authLogsList = [...mockAuthLogs]
let bannedIpsList = [...mockBannedIps]
let announcementsList = [...mockAnnouncements]
let schoolSettingsState = { ...mockSchoolSettings }
let formConfigState = { ...mockFormConfig }

let academicYearsList = [...mockAcademicYears]
let levelsList = [...mockLevels]
let majorsList = [...mockMajors]
let gradesList = [...mockGrades]

let studentsList: StudentItem[] = [...mockStudents]
let studentCostsList: StudentCostItem[] = [...mockStudentCosts]
let capabilityMatrixList: StudentCapabilityMatrixItem[] = [...mockStudentCapabilityMatrix]
let capabilitiesList: StudentCapabilityItem[] = [...mockCapabilities]
let invoicesList: StudentInvoiceItem[] = [...mockInvoices]
let transactionsList: StudentTransactionItem[] = [...mockStudentTransactions]
let alumniList: AlumniItem[] = [...mockAlumni]
let registrantsList: AdminRegistrantItem[] = [...mockRegistrants]
let ewalletsList: AdminEwalletItem[] = [...mockEwallets]
let bankConfirmationsList: BankTransferConfirmationItem[] = [...mockBankConfirmations]
let withdrawalsList: WithdrawalRequestItem[] = [...mockWithdrawals]
let merchantsList: AdminMerchantItem[] = [...mockMerchants]


export const hijackAdminApi = (realApi: AdminApi): AdminApi => {
	if (!IS_DEV_HIJACK) return realApi

	return {
		login: async (data: AdminLoginDto): Promise<AdminLoginResponse> => {
			await delay(300)
			if (data.email.includes("2fa")) {
				return { requires2fa: true, adminId: 1, email: data.email }
			}
			const matchedUser = usersList.find((u) => u.email === data.email) || mockAdminUsers[0]!
			return {
				requires2fa: false,
				accessToken: "mock-admin-access-token",
				refreshToken: "mock-admin-refresh-token",
				user: {
					id: matchedUser.id,
					email: matchedUser.email,
					name: matchedUser.name,
					role: matchedUser.role,
					domain: "admin",
				},
			}
		},

		verify2fa: async (_code: string, adminId: number): Promise<AdminLoginResponse> => {
			await delay(300)
			const matchedUser = usersList.find((u) => u.id === adminId) || mockAdminUsers[0]!
			return {
				requires2fa: false,
				accessToken: "mock-admin-access-token-2fa",
				refreshToken: "mock-admin-refresh-token-2fa",
				user: {
					id: matchedUser.id,
					email: matchedUser.email,
					name: matchedUser.name,
					role: matchedUser.role,
					domain: "admin",
				},
			}
		},

		resend2fa: async () => {
			await delay(200)
			return { message: "Kode 2FA baru telah dikirim ke email terdaftar Anda." }
		},

		forgotPassword: async () => {
			await delay(250)
			return { message: "Instruksi pemulihan kata sandi telah dikirim ke email Anda." }
		},

		resetPassword: async () => {
			await delay(300)
			return { message: "Kata sandi berhasil diperbarui. Silakan login kembali." }
		},

		logout: async () => {
			await delay(150)
			return { message: "Berhasil keluar dari sesi Admin." }
		},

		getMyProfile: async (): Promise<AdminUserItem> => {
			await delay(200)
			return usersList[0] || mockAdminUsers[0]!
		},

		updateMyProfile: async (data) => {
			await delay(300)
			const target = usersList[0] || mockAdminUsers[0]!
			Object.assign(target, data)
			return { message: "Profil berhasil diperbarui." }
		},

		changePassword: async () => {
			await delay(300)
			return { message: "Kata sandi Anda berhasil diperbarui." }
		},

		getDashboardStats: async (params) => {
			await delay(250)
			const yearId = params?.academicYearId
			return yearId === undefined ? mockDashboardStats : (mockDashboardStatsByYear[yearId] ?? { total: 0, approve: 0, reject: 0 })
		},

		getDashboardOptions: async () => {
			await delay(150)
			return mockDashboardOptions
		},

		getDashboardChartStudent: async (params) => {
			await delay(250)
			return mockDashboardChartStudent(params.grade)
		},

		getDashboardPieChart: async () => {
			await delay(250)
			return mockDashboardPie
		},

		getReportOptions: async () => {
			await delay(150)
			return mockReportOptions
		},

		getReportIncomeDetail: async (params) => {
			await delay(300)
			return mockReportIncomeDetail(params)
		},

		getReportIncomeRecap: async (params) => {
			await delay(300)
			return mockReportIncomeRecap(params)
		},

		getReportArrears: async (params) => {
			await delay(300)
			return mockReportArrears(params)
		},

		downloadReport: async (kind) => {
			await delay(400)
			return { blob: new Blob([`dev mock export: ${kind}`]), fileName: REPORT_FILE_NAMES[kind] }
		},

		getUsers: async (params) => {
			await delay(200)
			let filtered = [...usersList]
			if (params?.search) {
				const q = params.search.toLowerCase()
				filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
			}
			if (params?.role) {
				filtered = filtered.filter((u) => u.role === params.role)
			}
			return {
				success: true,
				data: { items: filtered, total: filtered.length, page: params?.page || 1, limit: params?.limit || 10, lastPage: 1 },
				message: "Users retrieved successfully",
			}
		},

		createUser: async (dto) => {
			await delay(300)
			const newUser: AdminUserItem = {
				id: Date.now(),
				name: dto.name,
				email: dto.email,
				role: dto.role,
				phone: dto.phone || "-",
				isActive: true,
				twoFactorEnabled: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			usersList.unshift(newUser)
			return { success: true, data: newUser, message: "Pengguna baru berhasil ditambahkan." }
		},

		updateUser: async (id, dto) => {
			await delay(250)
			const user = usersList.find((u) => u.id === id)
			if (user) Object.assign(user, dto, { updatedAt: new Date().toISOString() })
			return { success: true, data: user!, message: "Data pengguna berhasil diperbarui." }
		},

		toggleUserStatus: async (id, isActive) => {
			await delay(200)
			const user = usersList.find((u) => u.id === id)
			if (user) user.isActive = isActive
			return { success: true, data: { message: `Status pengguna berhasil diubah menjadi ${isActive ? "Aktif" : "Non-aktif"}.` }, message: "OK" }
		},

		getAuthLogs: async (params) => {
			await delay(200)
			let filtered = [...authLogsList]
			if (params?.search) {
				const q = params.search.toLowerCase()
				filtered = filtered.filter((l) => l.userName.toLowerCase().includes(q) || l.ipAddress.includes(q))
			}
			return {
				success: true,
				data: { items: filtered, total: filtered.length, page: 1, limit: 10, lastPage: 1 },
				message: "Logs retrieved successfully",
			}
		},

		getBannedIps: async (params) => {
			await delay(200)
			let filtered = [...bannedIpsList]
			if (params?.search) {
				filtered = filtered.filter((b) => b.ipAddress.includes(params.search!) || b.reason.toLowerCase().includes(params.search!.toLowerCase()))
			}
			return {
				success: true,
				data: { items: filtered, total: filtered.length, page: 1, limit: 10, lastPage: 1 },
				message: "Banned IPs retrieved successfully",
			}
		},

		createBannedIp: async (dto) => {
			await delay(300)
			const newBan: any = {
				id: Date.now(),
				ipAddress: dto.ipAddress,
				reason: dto.reason,
				bannedBy: "Super Administrator",
				createdAt: new Date().toISOString(),
			}
			bannedIpsList.unshift(newBan)
			return { success: true, data: newBan, message: "IP address berhasil diblokir." }
		},

		deleteBannedIp: async (id) => {
			await delay(200)
			bannedIpsList = bannedIpsList.filter((b) => b.id !== id)
			return { success: true, data: { message: "Blokir IP berhasil dihapus." }, message: "OK" }
		},

		getSchoolSettings: async () => {
			await delay(200)
			return { success: true, data: schoolSettingsState, message: "OK" }
		},

		updateSchoolSettings: async (data) => {
			await delay(300)
			schoolSettingsState = { ...data }
			return { success: true, data: { message: "Profil sekolah berhasil disimpan." }, message: "OK" }
		},

		getAnnouncements: async () => {
			await delay(200)
			return { success: true, data: announcementsList, message: "OK" }
		},

		createAnnouncement: async (dto) => {
			await delay(300)
			const item: any = { id: Date.now(), ...dto, isActive: dto.isActive ?? true, createdAt: new Date().toISOString() }
			announcementsList.unshift(item)
			return { success: true, data: item, message: "Pengumuman berhasil dibuat." }
		},

		updateAnnouncement: async (id, dto) => {
			await delay(250)
			const item = announcementsList.find((a) => a.id === id)
			if (item) Object.assign(item, dto)
			return { success: true, data: item!, message: "Pengumuman diperbarui." }
		},

		deleteAnnouncement: async (id) => {
			await delay(200)
			announcementsList = announcementsList.filter((a) => a.id !== id)
			return { success: true, data: { message: "Pengumuman dihapus." }, message: "OK" }
		},

		getFormConfig: async () => {
			await delay(200)
			return { success: true, data: formConfigState, message: "OK" }
		},

		updateFormConfig: async (data) => {
			await delay(250)
			Object.assign(formConfigState, data)
			return { success: true, data: { message: "Konfigurasi formulir PSB disimpan." }, message: "OK" }
		},

		toggle2faSystem: async (enabled) => {
			await delay(200)
			return { success: true, data: { message: `2FA sistem ${enabled ? "diaktifkan" : "dinonaktifkan"}.` }, message: "OK" }
		},

		// Academic Structure (Sprint B)
		getAcademicYears: async () => {
			await delay(200)
			return { success: true, data: academicYearsList, message: "OK" }
		},

		createAcademicYear: async (dto) => {
			await delay(300)
			if (dto.isCurrent) {
				academicYearsList.forEach((y) => (y.isCurrent = false))
			}
			const newYear: any = { id: Date.now(), ...dto, isCurrent: dto.isCurrent ?? false, status: "ACTIVE", studentCount: 0 }
			academicYearsList.unshift(newYear)
			return { success: true, data: newYear, message: "Tahun akademik berhasil dibuat." }
		},

		updateAcademicYear: async (id, dto) => {
			await delay(250)
			const year = academicYearsList.find((y) => y.id === id)
			if (year) Object.assign(year, dto)
			return { success: true, data: year!, message: "Tahun akademik diperbarui." }
		},

		setActiveAcademicYear: async (id) => {
			await delay(250)
			academicYearsList.forEach((y) => (y.isCurrent = y.id === id))
			return { success: true, data: { message: "Tahun akademik aktif diperbarui." }, message: "OK" }
		},

		getLevels: async () => {
			await delay(200)
			return { success: true, data: levelsList, message: "OK" }
		},

		createLevel: async (dto) => {
			await delay(300)
			const newLevel: any = { id: Date.now(), ...dto, academicYearIds: [1], majorIds: dto.majorIds || [] }
			levelsList.push(newLevel)
			return { success: true, data: newLevel, message: "Jenjang pendidikan berhasil ditambahkan." }
		},

		updateLevel: async (id, dto) => {
			await delay(250)
			const level = levelsList.find((l) => l.id === id)
			if (level) Object.assign(level, dto)
			return { success: true, data: level!, message: "Jenjang pendidikan diperbarui." }
		},

		deleteLevel: async (id) => {
			await delay(200)
			levelsList = levelsList.filter((l) => l.id !== id)
			return { success: true, data: { message: "Jenjang pendidikan dihapus." }, message: "OK" }
		},

		getMajors: async () => {
			await delay(200)
			return { success: true, data: majorsList, message: "OK" }
		},

		createMajor: async (dto) => {
			await delay(300)
			const newMajor: any = { id: Date.now(), ...dto }
			majorsList.push(newMajor)
			return { success: true, data: newMajor, message: "Jurusan baru berhasil dibuat." }
		},

		updateMajor: async (id, dto) => {
			await delay(250)
			const major = majorsList.find((m) => m.id === id)
			if (major) Object.assign(major, dto)
			return { success: true, data: major!, message: "Data jurusan diperbarui." }
		},

		deleteMajor: async (id) => {
			await delay(200)
			majorsList = majorsList.filter((m) => m.id !== id)
			return { success: true, data: { message: "Jurusan berhasil dihapus." }, message: "OK" }
		},

		getGrades: async () => {
			await delay(200)
			return { success: true, data: gradesList, message: "OK" }
		},

		createGrade: async (dto) => {
			await delay(300)
			const level = levelsList.find((l) => l.id === dto.levelId)
			const newGrade: any = { id: Date.now(), ...dto, levelName: level?.name || "", subGrades: [] }
			gradesList.push(newGrade)
			return { success: true, data: newGrade, message: "Kelas baru berhasil dibuat." }
		},

		updateGrade: async (id, dto) => {
			await delay(250)
			const grade = gradesList.find((g) => g.id === id)
			if (grade) Object.assign(grade, dto)
			return { success: true, data: grade!, message: "Data kelas diperbarui." }
		},

		deleteGrade: async (id) => {
			await delay(200)
			gradesList = gradesList.filter((g) => g.id !== id)
			return { success: true, data: { message: "Kelas berhasil dihapus." }, message: "OK" }
		},

		createSubGrade: async (dto) => {
			await delay(300)
			const grade = gradesList.find((g) => g.id === dto.gradeId)
			const newSub: any = { id: Date.now(), ...dto, studentCount: 0 }
			if (grade) grade.subGrades.push(newSub)
			return { success: true, data: newSub, message: "Sub-kelas berhasil ditambahkan." }
		},

		updateSubGrade: async (id, dto) => {
			await delay(250)
			for (const grade of gradesList) {
				const sub = grade.subGrades.find((s) => s.id === id)
				if (sub) Object.assign(sub, dto)
			}
			return { success: true, data: {} as any, message: "Sub-kelas diperbarui." }
		},

		deleteSubGrade: async (id) => {
			await delay(200)
			for (const grade of gradesList) {
				grade.subGrades = grade.subGrades.filter((s) => s.id !== id)
			}
			return { success: true, data: { message: "Sub-kelas dihapus." }, message: "OK" }
		},

		// Sprint C Handlers
		getStudents: async (params) => {
			await delay(200)
			let filtered = [...studentsList]
			if (params?.search) {
				const q = params.search.toLowerCase()
				filtered = filtered.filter((s) => s.fullName.toLowerCase().includes(q) || s.nis.includes(q))
			}
			if (params?.status) {
				filtered = filtered.filter((s) => s.status === params.status)
			}
			return { success: true, data: { items: filtered, total: filtered.length, page: 1, limit: 10, lastPage: 1 }, message: "OK" }
		},

		getStudentById: async (id) => {
			await delay(150)
			const student = studentsList.find((s) => s.id === id) || studentsList[0]!
			return { success: true, data: student, message: "OK" }
		},

		createStudent: async (dto) => {
			await delay(300)
			const newStudent: any = { id: Date.now(), ...dto, status: "ACTIVE", createdAt: new Date().toISOString() }
			studentsList.unshift(newStudent)
			return { success: true, data: newStudent, message: "Santri baru berhasil didaftarkan." }
		},

		updateStudent: async (id, dto) => {
			await delay(250)
			const student = studentsList.find((s) => s.id === id)
			if (student) Object.assign(student, dto)
			return { success: true, data: student!, message: "Data santri berhasil diperbarui." }
		},

		bulkPromoteStudents: async (data) => {
			await delay(300)
			const targetGrade = gradesList.find((g) => g.id === data.targetGradeId)
			const targetSubGrade = targetGrade?.subGrades.find((s) => s.id === data.targetSubGradeId)
			const targetAy = academicYearsList.find((a) => a.id === data.targetAcademicYearId)
			studentsList.forEach((s) => {
				if (data.studentIds.includes(s.id)) {
					if (targetGrade) s.gradeName = targetGrade.name
					if (targetSubGrade) s.subGradeName = targetSubGrade.name
					if (targetAy) s.academicYear = targetAy.year
				}
			})
			return { success: true, data: { count: data.studentIds.length }, message: `${data.studentIds.length} Santri berhasil dinaikkan kelas.` }
		},

		bulkRetainStudents: async (data) => {
			await delay(300)
			const targetAy = academicYearsList.find((a) => a.id === data.targetAcademicYearId)
			studentsList.forEach((s) => {
				if (data.studentIds.includes(s.id) && targetAy) {
					s.academicYear = targetAy.year
				}
			})
			return { success: true, data: { count: data.studentIds.length }, message: `${data.studentIds.length} Santri tercatat tinggal kelas.` }
		},

		bulkChangeSubGrade: async (data) => {
			await delay(300)
			let subName = "Rombel Baru"
			for (const g of gradesList) {
				const match = g.subGrades.find((sub) => sub.id === data.targetSubGradeId)
				if (match) subName = match.name
			}
			studentsList.forEach((s) => {
				if (data.studentIds.includes(s.id)) {
					s.subGradeName = subName
				}
			})
			return { success: true, data: { count: data.studentIds.length }, message: `${data.studentIds.length} Santri dipindahkan subkelas.` }
		},

		bulkChangeMajor: async (data) => {
			await delay(300)
			const major = majorsList.find((m) => m.id === data.targetMajorId)
			studentsList.forEach((s) => {
				if (data.studentIds.includes(s.id) && major) {
					s.gradeName = `${s.gradeName.split(" ")[0]} ${major.code}`
				}
			})
			return { success: true, data: { count: data.studentIds.length }, message: `${data.studentIds.length} Santri dipindahkan jurusan.` }
		},

		bulkChangeStatus: async (data) => {
			await delay(300)
			studentsList.forEach((s) => {
				if (data.studentIds.includes(s.id)) {
					s.status = data.status as any
				}
			})
			return { success: true, data: { count: data.studentIds.length }, message: `Status ${data.studentIds.length} santri diperbarui.` }
		},

		bulkGraduateStudents: async (data) => {
			await delay(350)
			studentsList.forEach((s) => {
				if (data.studentIds.includes(s.id)) {
					s.status = "ALUMNI"
					alumniList.unshift({
						id: Date.now() + s.id,
						studentId: s.id,
						nis: s.nis,
						fullName: s.fullName,
						graduationYear: data.graduationYear,
						destination: data.destination || "Belum dicatat",
						phone: s.phone,
					})
				}
			})
			return { success: true, data: { count: data.studentIds.length }, message: `${data.studentIds.length} Santri berhasil diluluskan ke Alumni.` }
		},

		// Student Costs (Tarif per Akun)
		getStudentCosts: async (params) => {
			await delay(200)
			let filtered = [...studentCostsList]
			if (params?.academicYearId) filtered = filtered.filter((c) => c.academicYearId === params.academicYearId)
			if (params?.gradeId) filtered = filtered.filter((c) => c.gradeId === params.gradeId)
			return { success: true, data: filtered, message: "OK" }
		},

		createStudentCost: async (dto) => {
			await delay(300)
			const ay = academicYearsList.find((a) => a.id === dto.academicYearId)
			const gr = gradesList.find((g) => g.id === dto.gradeId)
			const newItem: StudentCostItem = {
				id: Date.now(),
				...dto,
				academicYearName: ay ? `${ay.year} - ${ay.semester}` : "2024/2025",
				gradeName: gr ? gr.name : "Kelas 7",
				isActive: dto.isActive ?? true,
			}
			studentCostsList.unshift(newItem)
			return { success: true, data: newItem, message: "Tarif akun biaya berhasil ditambahkan." }
		},

		updateStudentCost: async (id, dto) => {
			await delay(250)
			const item = studentCostsList.find((c) => c.id === id)
			if (item) Object.assign(item, dto)
			return { success: true, data: item!, message: "Tarif akun biaya berhasil diperbarui." }
		},

		deleteStudentCost: async (id) => {
			await delay(200)
			studentCostsList = studentCostsList.filter((c) => c.id !== id)
			return { success: true, data: { message: "Tarif akun biaya berhasil dihapus." }, message: "OK" }
		},

		getCapabilities: async () => {
			await delay(200)
			return { success: true, data: capabilitiesList, message: "OK" }
		},

		getStudentCapabilityMatrix: async () => {
			await delay(200)
			return { success: true, data: capabilityMatrixList, message: "OK" }
		},

		updateStudentCapability: async (dto) => {
			await delay(250)
			const matrixRow = capabilityMatrixList.find((m) => m.studentId === dto.studentId)
			if (matrixRow) {
				const cap = matrixRow.capabilities.find((c) => c.costItemId === dto.costItemId)
				if (cap) {
					cap.discountPercent = dto.discountPercent
					cap.finalAmount = Math.round(cap.nominal * (1 - dto.discountPercent / 100))
				}
			}
			return { success: true, data: { message: "Kesanggupan santri berhasil diperbarui." }, message: "OK" }
		},

		getInvoices: async (params) => {
			await delay(200)
			let filtered = [...invoicesList]
			if (params?.search) {
				const q = params.search.toLowerCase()
				filtered = filtered.filter((i) => i.invoiceNumber.toLowerCase().includes(q) || i.studentName.toLowerCase().includes(q))
			}
			if (params?.status) {
				filtered = filtered.filter((i) => i.status === params.status)
			}
			return { success: true, data: { items: filtered, total: filtered.length, page: 1, limit: 10, lastPage: 1 }, message: "OK" }
		},

		bulkGenerateInvoices: async () => {
			await delay(400)
			return { success: true, data: { generatedCount: 28 }, message: "28 Tagihan berhasil dibuat." }
		},

		addInvoiceTransaction: async (invoiceId, dto) => {
			await delay(300)
			const inv = invoicesList.find((i) => i.id === invoiceId)
			if (inv) {
				inv.paidAmount = Math.min(inv.amount, inv.paidAmount + dto.amount)
				inv.status = inv.paidAmount >= inv.amount ? "PAID" : "PARTIAL"
				if (!inv.transactions) inv.transactions = []
				inv.transactions.push({
					id: Date.now(),
					amount: dto.amount,
					paymentMethod: dto.paymentMethod,
					paidAt: new Date().toISOString(),
					recordedBy: "Super Administrator",
				})
				transactionsList.unshift({
					id: Date.now(),
					transactionNumber: `TRX-${Date.now().toString().slice(-6)}`,
					invoiceNumber: inv.invoiceNumber,
					studentName: inv.studentName,
					nis: "202407001",
					gradeName: inv.gradeName,
					amount: dto.amount,
					paymentMethod: dto.paymentMethod as any,
					cashierName: "Koperasi & Kasir Utama",
					paidAt: new Date().toISOString(),
					notes: dto.notes || "Pembayaran Tagihan Kasir",
				})
			}
			return { success: true, data: inv!, message: "Pembayaran tagihan berhasil dicatat." }
		},

		getStudentTransactions: async (params) => {
			await delay(200)
			let filtered = [...transactionsList]
			if (params?.search) {
				const q = params.search.toLowerCase()
				filtered = filtered.filter((t) => t.studentName.toLowerCase().includes(q) || t.transactionNumber.toLowerCase().includes(q) || t.invoiceNumber.toLowerCase().includes(q))
			}
			return { success: true, data: { items: filtered, total: filtered.length, page: 1, limit: 10, lastPage: 1 }, message: "OK" }
		},

		getAlumni: async () => {
			await delay(200)
			return { success: true, data: { items: alumniList, total: alumniList.length, page: 1, limit: 10, lastPage: 1 }, message: "OK" }
		},

		// Sprint D Handlers
		getRegistrants: async (params) => {
			await delay(200)
			let filtered = [...registrantsList]
			if (params?.search) {
				const q = params.search.toLowerCase()
				filtered = filtered.filter((r) => r.fullName.toLowerCase().includes(q) || r.registrationNumber.toLowerCase().includes(q))
			}
			if (params?.status) {
				filtered = filtered.filter((r) => r.status === params.status)
			}
			return { success: true, data: { items: filtered, total: filtered.length, page: 1, limit: 10, lastPage: 1 }, message: "OK" }
		},

		getRegistrantById: async (id) => {
			await delay(150)
			const reg = registrantsList.find((r) => r.id === id) || registrantsList[0]!
			return { success: true, data: reg, message: "OK" }
		},

		acceptRegistrant: async (id) => {
			await delay(250)
			const reg = registrantsList.find((r) => r.id === id)
			if (reg) reg.status = "ACCEPTED"
			return { success: true, data: { message: "Pendaftar berhasil diterima." }, message: "OK" }
		},

		rejectRegistrant: async (id, reason) => {
			await delay(250)
			const reg = registrantsList.find((r) => r.id === id)
			if (reg) {
				reg.status = "REJECTED"
				reg.rejectionReason = reason
			}
			return { success: true, data: { message: "Pendaftar berhasil ditolak." }, message: "OK" }
		},

		markRegistrantInvalid: async (id) => {
			await delay(250)
			const reg = registrantsList.find((r) => r.id === id)
			if (reg) reg.status = "INVALID"
			return { success: true, data: { message: "Berkas pendaftar ditandai tidak valid." }, message: "OK" }
		},

		// Sprint E Handlers
		getEwallets: async () => {
			await delay(200)
			return { success: true, data: { items: ewalletsList, total: ewalletsList.length, page: 1, limit: 10, lastPage: 1 }, message: "OK" }
		},

		topUpEwalletCash: async (id, amount) => {
			await delay(300)
			const ew = ewalletsList.find((e) => e.id === id)
			if (ew) {
				ew.balance += amount
				ew.lastTransactionAt = new Date().toISOString()
			}
			return { success: true, data: { message: "Top-up tunai berhasil diproses." }, message: "OK" }
		},

		withdrawEwalletCash: async (dto) => {
			await delay(300)
			const ew = ewalletsList.find((e) => e.id === dto.ewalletAccountId)
			if (ew) {
				if (ew.balance < dto.amount) {
					throw new Error("Saldo e-wallet tidak mencukupi untuk penarikan tunai.")
				}
				ew.balance -= dto.amount
				ew.lastTransactionAt = new Date().toISOString()
			}
			return { success: true, data: { message: "Penarikan tunai berhasil diproses." }, message: "OK" }
		},

		resetEwalletPin: async () => {
			await delay(250)
			return { success: true, data: { message: "PIN e-wallet berhasil direset ke 123456." }, message: "OK" }
		},

		getBankTransferConfirmations: async () => {
			await delay(200)
			return { success: true, data: { items: bankConfirmationsList, total: bankConfirmationsList.length, page: 1, limit: 10, lastPage: 1 }, message: "OK" }
		},

		approveBankTransfer: async (id) => {
			await delay(300)
			const tf = bankConfirmationsList.find((b) => b.id === id)
			if (tf) {
				tf.status = "APPROVED"
				const ew = ewalletsList.find((e) => e.id === tf.ewalletAccountId)
				if (ew) ew.balance += tf.amount
			}
			return { success: true, data: { message: "Konfirmasi transfer bank disetujui." }, message: "OK" }
		},

		rejectBankTransfer: async (id) => {
			await delay(250)
			const tf = bankConfirmationsList.find((b) => b.id === id)
			if (tf) tf.status = "REJECTED"
			return { success: true, data: { message: "Konfirmasi transfer bank ditolak." }, message: "OK" }
		},

		getWithdrawalRequests: async () => {
			await delay(200)
			return { success: true, data: { items: withdrawalsList, total: withdrawalsList.length, page: 1, limit: 10, lastPage: 1 }, message: "OK" }
		},

		approveWithdrawal: async (id) => {
			await delay(300)
			const wd = withdrawalsList.find((w) => w.id === id)
			if (wd) {
				wd.status = "APPROVED"
				const ew = ewalletsList.find((e) => e.id === wd.ewalletAccountId)
				if (ew) ew.balance = Math.max(0, ew.balance - wd.amount)
			}
			return { success: true, data: { message: "Penarikan saldo e-wallet disetujui." }, message: "OK" }
		},

		rejectWithdrawal: async (id) => {
			await delay(250)
			const wd = withdrawalsList.find((w) => w.id === id)
			if (wd) wd.status = "REJECTED"
			return { success: true, data: { message: "Permintaan penarikan ditolak." }, message: "OK" }
		},

		getMerchants: async () => {
			await delay(200)
			return { success: true, data: { items: merchantsList, total: merchantsList.length, page: 1, limit: 10, lastPage: 1 }, message: "OK" }
		},

		createMerchant: async (dto) => {
			await delay(300)
			const newM: any = {
				id: Date.now(),
				...dto,
				qrCodePayload: `ROJA-MERCH-${Date.now()}`,
				isActive: true,
				createdAt: new Date().toISOString(),
			}
			merchantsList.unshift(newM)
			return { success: true, data: newM, message: "Akun Merchant berhasil didaftarkan." }
		},

		toggleMerchantStatus: async (id, isActive) => {
			await delay(200)
			const m = merchantsList.find((x) => x.id === id)
			if (m) m.isActive = isActive
			return { success: true, data: { message: `Status Merchant ${isActive ? "diaktifkan" : "dinonaktifkan"}.` }, message: "OK" }
		},
	}
}


