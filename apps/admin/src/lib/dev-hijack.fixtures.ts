import type {
	AuthUser,
	BannedIpItem,
	StudentItem,
	AlumniItem,
	AdminRegistrantItem,
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

// Sprint C Fixtures: Students, Alumni
export const mockStudents: StudentItem[] = [
	{
		id: 1,
		nis: "202407001",
		nisn: "0081234567",
		fullName: "Muhammad Farel Rabbani",
		gender: "L",
		pob: "Jakarta",
		dob: "2010-05-12",
		phone: "081234112233",
		gradeName: "Kelas 7",
		subGradeName: "7-A (Putra)",
		academicYear: "2024/2025",
		status: "ACTIVE",
		createdAt: "2024-07-01T00:00:00Z",
		address: "Jl. Merdeka No. 12, Jakarta Selatan",
		fatherName: "H. Ahmad Fauzi",
		motherName: "Hj. Ratna Sari",
		guardianName: "H. Ahmad Fauzi",
		healthNotes: "Alergi debu & kacang",
	},
	{
		id: 2,
		nis: "202407002",
		nisn: "0081234568",
		fullName: "Aisyah Nur Syafiqah",
		gender: "P",
		pob: "Bogor",
		dob: "2010-08-20",
		phone: "081234112244",
		gradeName: "Kelas 7",
		subGradeName: "7-B (Putri)",
		academicYear: "2024/2025",
		status: "ACTIVE",
		createdAt: "2024-07-01T00:00:00Z",
		address: "Jl. Pajajaran No. 45, Bogor",
		fatherName: "Ust. M. Yusuf",
		motherName: "Siti Aminah",
		guardianName: "Ust. M. Yusuf",
	},
]

export const mockAlumni: AlumniItem[] = [
	{
		id: 1,
		studentId: 90,
		nis: "202107099",
		fullName: "Rizky Ramadhan Pasha",
		graduationYear: "2024",
		destination: "Universitas Indonesia - Teknik Informatika",
		phone: "081299008877",
	},
]

// Sprint D Fixtures: PSB Registrants
export const mockRegistrants: AdminRegistrantItem[] = [
	{
		id: 1,
		registrationNumber: "PSB-2026-0001",
		fullName: "Bilal Ahmad Zulfikar",
		gender: "L",
		chosenLevel: "Tsanawiyah (SMP)",
		chosenMajor: "Umum",
		email: "bilal.ahmad@gmail.com",
		phone: "081900112233",
		status: "PENDING",
		registeredAt: "2026-09-02T10:00:00Z",
	},
	{
		id: 2,
		registrationNumber: "PSB-2026-0002",
		fullName: "Zahra Annisa Fitri",
		gender: "P",
		chosenLevel: "Aliyah (SMA)",
		chosenMajor: "Ilmu Pengetahuan Alam",
		email: "zahra.fitria@gmail.com",
		phone: "081900112244",
		status: "ACCEPTED",
		registeredAt: "2026-09-03T11:15:00Z",
	},
]

// Dashboard — also fed to the static legacy dashboard when comparing screenshots
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
