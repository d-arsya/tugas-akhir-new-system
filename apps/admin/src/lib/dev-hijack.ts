import type { AdminApi, AdminLoginDto, AdminLoginResponse } from "@roja/api-client"
import { getRuntimeEnv } from "@roja/utils"
import type {
	StudentItem,
	AlumniItem,
	AdminRegistrantItem,
} from "@roja/types"
import {
	hijackAuthUser,
	mockLoginUsers,
	mockBannedIps,
	mockStudents,
	mockAlumni,
	mockRegistrants,
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
let alumniList: AlumniItem[] = [...mockAlumni]
let registrantsList: AdminRegistrantItem[] = [...mockRegistrants]


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
	}
}


