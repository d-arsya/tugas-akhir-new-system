import type { AdminApi } from "@roja/api-client"
import type { AdminUserDetail, AdminUserRow, AuthLogRow } from "@roja/types"

// WS-A owns this file: Pengelola, Buat Password and Authentication Log mocks.
// Shapes follow the legacy pages; rows imitate `tbr_users` and `tbr_auth_logs`.

type UsersHijack = Pick<
	AdminApi,
	| "getUsers"
	| "getUser"
	| "createUser"
	| "updateUser"
	| "deleteUser"
	| "checkCreatePassword"
	| "createPassword"
	| "getAuthLogs"
>

const delay = (ms = 250): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const unix = (iso: string): number => Math.floor(new Date(iso).getTime() / 1000)

// "22 September 2026 jam 10:05" — legacy `datatableDate`
const MONTHS = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
]

const indoDateTime = (iso: string): string => {
	const date = new Date(iso)
	const pad = (value: number): string => String(value).padStart(2, "0")
	return `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()} jam ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const seed: (AdminUserDetail & { createdAtIso: string })[] = [
	{
		id: 2,
		name: "Ust. Ahmad Dahlan",
		email: "admin@pondokroja.ac.id",
		role: "Admin",
		gender: "male",
		isBlocked: false,
		createdAtIso: "2026-09-21T10:05:00",
	},
	{
		id: 3,
		name: "Hj. Siti Rahmah",
		email: "bendahara@pondokroja.ac.id",
		role: "Bendahara",
		gender: "female",
		isBlocked: false,
		createdAtIso: "2026-08-14T08:40:00",
	},
	{
		id: 4,
		name: "Kasir E-Wallet Utama",
		email: "kasir@pondokroja.ac.id",
		role: "Kasir E-Wallet",
		gender: "male",
		isBlocked: false,
		createdAtIso: "2026-07-02T15:12:00",
	},
	{
		id: 5,
		name: "Ust. Nonaktif",
		email: "nonaktif@pondokroja.ac.id",
		role: "Admin",
		gender: "male",
		isBlocked: true,
		createdAtIso: "2026-05-30T09:00:00",
	},
]

let usersList = [...seed]

const toRow = (user: (typeof seed)[number]): AdminUserRow => ({
	id: user.id,
	name: user.name,
	email: user.email,
	role: user.role,
	createdAt: indoDateTime(user.createdAtIso),
	createdAtTs: unix(user.createdAtIso),
	isBlocked: user.isBlocked,
})

const authLogs: AuthLogRow[] = [
	{
		id: 4316,
		email: "superadmin@pondokroja.ac.id",
		browser: "Google Chrome",
		os: "Win64",
		duration: "2 jam 2 menit 21 detik",
		lastSeen: "2 jam yang lalu",
		lastLogin: "22 September 2026 jam 08:15:09",
		lastLogout: "22 September 2026 jam 10:17:30",
		loginStatus: "Logged Out",
	},
	{
		id: 4315,
		email: "admin@pondokroja.ac.id",
		browser: "Mozilla Firefox",
		os: "Linux x86_64",
		duration: null,
		lastSeen: "10 menit yang lalu",
		lastLogin: "22 September 2026 jam 10:05:09",
		lastLogout: null,
		loginStatus: "Logged In",
	},
	{
		id: 4314,
		email: "-",
		browser: "Apple Safari",
		os: "Intel Mac OS X 10_15_7",
		duration: null,
		lastSeen: "1 detik yang lalu",
		lastLogin: null,
		lastLogout: null,
		loginStatus: "Failed",
	},
]

export const usersHijack: UsersHijack = {
	getUsers: async () => {
		await delay()
		return usersList.map(toRow)
	},

	getUser: async (id) => {
		await delay(150)
		const user = usersList.find((entry) => entry.id === id)
		// Legacy answers 404 for an unknown (or Superadmin) row
		if (!user) throw new Error("Pengelola tidak ditemukan.")
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			gender: user.gender,
			isBlocked: user.isBlocked,
		}
	},

	createUser: async (data) => {
		await delay(300)
		usersList = [
			{
				id: Math.max(...usersList.map((entry) => entry.id)) + 1,
				name: data.name,
				email: data.email ?? null,
				role: data.role,
				gender: data.gender,
				isBlocked: data.isBlocked,
				createdAtIso: new Date().toISOString(),
			},
			...usersList,
		]
		return { message: "Data berhasil disimpan ke dalam basis data." }
	},

	updateUser: async (id, data) => {
		await delay(300)
		usersList = usersList.map((entry) =>
			entry.id === id
				? { ...entry, name: data.name, gender: data.gender, role: data.role, isBlocked: data.isBlocked }
				: entry,
		)
		return { message: "Data berhasil diupdate." }
	},

	deleteUser: async (id) => {
		await delay(300)
		usersList = usersList.filter((entry) => entry.id !== id)
		return { message: "Data berhasil dihapus dari basis data." }
	},

	checkCreatePassword: async (_token, email) => {
		await delay(150)
		return { email, name: "Ust. Baru", role: "Admin" }
	},

	createPassword: async () => {
		await delay(300)
		return {
			requires2fa: false,
			accessToken: "mock-admin-access-token",
			refreshToken: "mock-admin-refresh-token",
			user: {
				id: 2,
				email: "admin@pondokroja.ac.id",
				name: "Ust. Ahmad Dahlan",
				role: "Admin",
				domain: "admin",
			},
		}
	},

	getAuthLogs: async (params) => {
		await delay()
		const search = (params.search ?? "").toLowerCase()
		const rows = search
			? authLogs.filter((row) =>
					search
						.split(/\s+/)
						.every((word) =>
							[row.email, row.browser, row.os, row.duration, row.lastLogin, row.lastLogout, row.loginStatus]
								.filter((value): value is string => typeof value === "string")
								.some((value) => value.toLowerCase().includes(word)),
						),
				)
			: authLogs
		const limit = params.limit ?? 10
		const page = params.page ?? 1
		return {
			data: rows.slice((page - 1) * limit, page * limit),
			meta: { page, limit, total: rows.length, totalPages: Math.max(1, Math.ceil(rows.length / limit)) },
		}
	},
}
