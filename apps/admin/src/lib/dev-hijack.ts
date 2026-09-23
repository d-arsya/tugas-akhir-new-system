import type { AdminApi, AdminLoginDto, AdminLoginResponse } from "@roja/api-client"
import { getRuntimeEnv } from "@roja/utils"
import type {
	StudentItem,
	StudentCapabilityItem,
	StudentInvoiceItem,
	AlumniItem,
	AdminRegistrantItem,
	AdminEwalletItem,
	BankTransferConfirmationItem,
	WithdrawalRequestItem,
	StudentCapabilityMatrixItem,
	StudentTransactionItem,
} from "@roja/types"
import {
	hijackAuthUser,
	mockLoginUsers,
	mockBannedIps,
	mockStudents,
	mockCapabilities,
	mockInvoices,
	mockAlumni,
	mockRegistrants,
	mockEwallets,
	mockBankConfirmations,
	mockWithdrawals,
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
import { formHijack } from "./dev-hijack.form"
import { settingsHijack } from "./dev-hijack.settings"
import { systemHijack } from "./dev-hijack.system"
import { usersHijack } from "./dev-hijack.users"

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

let bannedIpsList = [...mockBannedIps]

let studentsList: StudentItem[] = [...mockStudents]
let capabilityMatrixList: StudentCapabilityMatrixItem[] = [...mockStudentCapabilityMatrix]
let capabilitiesList: StudentCapabilityItem[] = [...mockCapabilities]
let invoicesList: StudentInvoiceItem[] = [...mockInvoices]
let transactionsList: StudentTransactionItem[] = [...mockStudentTransactions]
let alumniList: AlumniItem[] = [...mockAlumni]
let registrantsList: AdminRegistrantItem[] = [...mockRegistrants]
let ewalletsList: AdminEwalletItem[] = [...mockEwallets]
let bankConfirmationsList: BankTransferConfirmationItem[] = [...mockBankConfirmations]
let withdrawalsList: WithdrawalRequestItem[] = [...mockWithdrawals]


export const hijackAdminApi = (realApi: AdminApi): AdminApi => {
	if (!IS_DEV_HIJACK) return realApi

	return {
		// Data Master (Tahun Ajaran, Jenjang, Jurusan, Kelas, Subkelas) has no mocks:
		// those pages are verified against a real database, so they fall through here.
		...realApi,
		...usersHijack,
		...settingsHijack,
		...formHijack,
		...systemHijack,

		login: async (data: AdminLoginDto): Promise<AdminLoginResponse> => {
			await delay(300)
			if (data.email.includes("2fa")) {
				return { requires2fa: true, adminId: 1, email: data.email }
			}
			const matchedUser = mockLoginUsers.find((u) => u.email === data.email) || mockLoginUsers[0]!
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
			const matchedUser = mockLoginUsers.find((u) => u.id === adminId) || mockLoginUsers[0]!
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

		// The Data Master mocks are gone, so these bulk actions no longer have a
		// grade/jurusan/tahun-ajaran fixture to resolve target names against.
		bulkPromoteStudents: async (data) => {
			await delay(300)
			return { success: true, data: { count: data.studentIds.length }, message: `${data.studentIds.length} Santri berhasil dinaikkan kelas.` }
		},

		bulkRetainStudents: async (data) => {
			await delay(300)
			return { success: true, data: { count: data.studentIds.length }, message: `${data.studentIds.length} Santri tercatat tinggal kelas.` }
		},

		bulkChangeSubGrade: async (data) => {
			await delay(300)
			studentsList.forEach((s) => {
				if (data.studentIds.includes(s.id)) {
					s.subGradeName = "Rombel Baru"
				}
			})
			return { success: true, data: { count: data.studentIds.length }, message: `${data.studentIds.length} Santri dipindahkan subkelas.` }
		},

		bulkChangeMajor: async (data) => {
			await delay(300)
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



	}
}


