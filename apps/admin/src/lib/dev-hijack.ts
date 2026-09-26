import type { AdminApi, AdminLoginDto, AdminLoginResponse } from "@roja/api-client"
import { getRuntimeEnv } from "@roja/utils"
import {
	hijackAuthUser,
	mockLoginUsers,
	mockBannedIps,
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
	}
}


