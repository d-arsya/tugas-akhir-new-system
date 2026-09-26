import type {
	AuthUser,
	BannedIpItem,
	DashboardStats,
	DashboardOptions,
	DashboardChartItem,
	DashboardPieItem,
} from "@roja/types"

export const hijackAuthUser: AuthUser = {
	id: 1,
	email: "superadmin@pondokroja.ac.id",
	name: "Super Administrator",
	role: "Superadmin",
	domain: "admin",
}

/** Accounts the mocked login accepts; the Pengelola list has its own fixtures. */
export const mockLoginUsers = [
	{ id: 1, name: "Super Administrator", email: "superadmin@pondokroja.ac.id", role: "Superadmin" },
	{ id: 2, name: "Ust. Ahmad Dahlan", email: "admin@pondokroja.ac.id", role: "Admin" },
	{ id: 3, name: "Hj. Siti Rahmah", email: "bendahara@pondokroja.ac.id", role: "Bendahara" },
	{ id: 4, name: "Kasir E-Wallet Utama", email: "kasir@pondokroja.ac.id", role: "Kasir E-Wallet" },
]

export const mockBannedIps: BannedIpItem[] = [
	{
		id: 1,
		ipAddress: "198.51.100.44",
		reason: "Percobaan brute-force login berulang kali",
		bannedBy: "Super Administrator",
		createdAt: "2026-09-01T12:00:00Z",
	},
]

export const mockDashboardStats: DashboardStats = { total: 186, approve: 142, reject: 23 }

export const mockDashboardStatsByYear: Record<number, DashboardStats> = {
	2: { total: 71, approve: 55, reject: 9 },
	3: { total: 115, approve: 87, reject: 14 },
}

export const mockDashboardOptions: DashboardOptions = {
	academicYears: [
		{ id: 2, year: "2024/2025" },
		{ id: 3, year: "2025/2026" },
	],
	grades: [7, 8, 9, 10, 11, 12].map((label) => ({ label })),
}

export const mockDashboardChartStudent = (grade: number): DashboardChartItem[] =>
	["2021/2022", "2022/2023", "2023/2024", "2024/2025", "2025/2026"].map((category, i) => ({
		category,
		value: 40 + ((grade * 7 + i * 13) % 35),
	}))

export const mockDashboardPie: DashboardPieItem[] = [
	{ grade: "Kelas 7", value: 58 },
	{ grade: "Kelas 8", value: 52 },
	{ grade: "Kelas 9", value: 47 },
	{ grade: "Kelas 10", value: 44 },
	{ grade: "Kelas 11", value: 39 },
	{ grade: "Kelas 12", value: 36 },
	{ grade: "Keluar", value: 6 },
]
