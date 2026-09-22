import type {
	AuthUser,
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
	DashboardStats,
	DashboardOptions,
	DashboardChartItem,
	DashboardPieItem,
} from "@roja/types"

export const hijackAuthUser: AuthUser = {
	id: 1,
	email: "superadmin@pondokroja.ac.id",
	name: "Super Administrator",
	role: "SUPERADMIN",
	domain: "admin",
}

export const mockAdminUsers: AdminUserItem[] = [
	{
		id: 1,
		name: "Super Administrator",
		email: "superadmin@pondokroja.ac.id",
		role: "SUPERADMIN",
		phone: "081234567890",
		isActive: true,
		twoFactorEnabled: true,
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
	},
	{
		id: 2,
		name: "Ust. Ahmad Dahlan (Admin Academic)",
		email: "admin.academic@pondokroja.ac.id",
		role: "ADMIN",
		phone: "081298765432",
		isActive: true,
		twoFactorEnabled: false,
		createdAt: "2026-01-10T00:00:00Z",
		updatedAt: "2026-01-10T00:00:00Z",
	},
	{
		id: 3,
		name: "Hj. Siti Rahmah (Bendahara)",
		email: "bendahara@pondokroja.ac.id",
		role: "BENDAHARA",
		phone: "081311223344",
		isActive: true,
		twoFactorEnabled: true,
		createdAt: "2026-01-15T00:00:00Z",
		updatedAt: "2026-01-15T00:00:00Z",
	},
	{
		id: 4,
		name: "Koperasi & Kasir Utama",
		email: "kasir@pondokroja.ac.id",
		role: "KASIR_EWALLET",
		phone: "081355667788",
		isActive: true,
		twoFactorEnabled: false,
		createdAt: "2026-02-01T00:00:00Z",
		updatedAt: "2026-02-01T00:00:00Z",
	},
]

export const mockAuthLogs: AuthLogItem[] = [
	{
		id: 101,
		userId: 1,
		userName: "Super Administrator",
		userEmail: "superadmin@pondokroja.ac.id",
		role: "SUPERADMIN",
		ipAddress: "127.0.0.1",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
		loginAt: "2026-09-14T08:30:00Z",
		logoutAt: null,
		status: "ACTIVE",
	},
	{
		id: 100,
		userId: 3,
		userName: "Hj. Siti Rahmah (Bendahara)",
		userEmail: "bendahara@pondokroja.ac.id",
		role: "BENDAHARA",
		ipAddress: "192.168.1.45",
		userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
		loginAt: "2026-09-14T07:15:00Z",
		logoutAt: "2026-09-14T08:00:00Z",
		status: "LOGGED_OUT",
	},
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

export const mockSchoolSettings: SettingSchoolData = {
	schoolName: "Pondok Pesantren Roja Islamiyyah",
	tagline: "Mencetak Generasi Rabbani & Berakhlakul Karimah",
	address: "Jl. Raya Pesantren No. 99, Kabupaten Bogor, Jawa Barat 16710",
	phone: "(0251) 8345678",
	email: "info@pondokroja.ac.id",
	website: "https://pondokroja.com",
	nsm: "121232010099",
	npsn: "69876543",
	principalName: "KH. Abdullah Syafi'i, M.Ag",
}

export const mockAnnouncements: SettingAnnouncementItem[] = [
	{
		id: 1,
		title: "Pendaftaran PSB Gelombang II Resmi Dibuka",
		content: "Calon santri baru dapat mengisi formulir pendaftaran secara online melalui portal PSB.",
		target: "PSB",
		isActive: true,
		createdAt: "2026-09-01T00:00:00Z",
	},
	{
		id: 2,
		title: "Jadwal Pembayaran SPP Bulanan",
		content: "Batas akhir pembayaran SPP setiap bulan adalah tanggal 10.",
		target: "SANTRI",
		isActive: true,
		createdAt: "2026-09-05T00:00:00Z",
	},
]

export const mockFormConfig: SettingFormConfig = {
	isPsbOpen: true,
	academicYearId: 1,
	registrationFee: 250000,
	contactPhone: "0812-9988-7766",
	instructionsNote: "Pastikan mengunggah dokumen KK dan Akta Kelahiran yang jelas dan terbaca.",
}

export const mockAcademicYears: AcademicYearItem[] = [
	{
		id: 1,
		year: "2024/2025",
		semester: "GENAP",
		isCurrent: true,
		startDate: "2024-07-01",
		endDate: "2025-06-30",
		status: "ACTIVE",
		studentCount: 450,
	},
	{
		id: 2,
		year: "2025/2026",
		semester: "GANJIL",
		isCurrent: false,
		startDate: "2025-07-01",
		endDate: "2026-06-30",
		status: "INACTIVE",
		studentCount: 0,
	},
]

export const mockLevels: LevelItem[] = [
	{
		id: 1,
		code: "TSA",
		name: "Tsanawiyah (SMP)",
		levelNumber: 7,
		description: "Jenjang Pendidikan Menengah Pertama",
		academicYearIds: [1],
		majorIds: [],
	},
	{
		id: 2,
		code: "ALI",
		name: "Aliyah (SMA)",
		levelNumber: 10,
		description: "Jenjang Pendidikan Menengah Atas",
		academicYearIds: [1],
		majorIds: [1, 2, 3],
	},
]

export const mockMajors: MajorItem[] = [
	{ id: 1, code: "IPA", name: "Ilmu Pengetahuan Alam", description: "Sains dan Matematika" },
	{ id: 2, code: "IPS", name: "Ilmu Pengetahuan Sosial", description: "Sosial dan Humaniora" },
	{ id: 3, code: "AGM", name: "Keagamaan / Al-Quran", description: "Pendalaman Studi Islam & Kitab Kuning" },
]

export const mockGrades: GradeItem[] = [
	{
		id: 1,
		levelId: 1,
		levelName: "Tsanawiyah (SMP)",
		name: "Kelas 7",
		code: "7",
		subGrades: [
			{ id: 101, gradeId: 1, name: "7-A (Putra)", capacity: 30, studentCount: 28 },
			{ id: 102, gradeId: 1, name: "7-B (Putri)", capacity: 30, studentCount: 30 },
		],
	},
	{
		id: 2,
		levelId: 2,
		levelName: "Aliyah (SMA)",
		name: "Kelas 10 IPA",
		code: "10-IPA",
		subGrades: [
			{ id: 201, gradeId: 2, name: "10-IPA-1", capacity: 28, studentCount: 26 },
		],
	},
]

// Sprint C Fixtures: Students, Capabilities, Invoices, Alumni
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

export const mockCapabilities: StudentCapabilityItem[] = [
	{ id: 1, code: "SPP-BULANAN", name: "SPP Syahriah Bulanan", amount: 650000, termName: "Bulanan", assignedStudentsCount: 450 },
	{ id: 2, code: "DU-TAHUNAN", name: "Daftar Ulang Tahunan", amount: 1500000, termName: "Tahunan", assignedStudentsCount: 450 },
	{ id: 3, code: "EAGLE-SCOUT", name: "Kegiatan Ekstrakurikuler Pramuka", amount: 150000, termName: "Semesteran", assignedStudentsCount: 120 },
]

export const mockInvoices: StudentInvoiceItem[] = [
	{
		id: 1,
		invoiceNumber: "INV/2026/09/001",
		studentId: 1,
		studentName: "Muhammad Farel Rabbani",
		gradeName: "Kelas 7",
		costTermName: "SPP September 2026",
		amount: 650000,
		paidAmount: 650000,
		status: "PAID",
		dueDate: "2026-09-10",
		createdAt: "2026-09-01T00:00:00Z",
		transactions: [
			{ id: 101, amount: 650000, paymentMethod: "TUNAI_KASIR", paidAt: "2026-09-05T09:30:00Z", recordedBy: "Kasir Utama" },
		],
	},
	{
		id: 2,
		invoiceNumber: "INV/2026/09/002",
		studentId: 2,
		studentName: "Aisyah Nur Syafiqah",
		gradeName: "Kelas 7",
		costTermName: "SPP September 2026",
		amount: 650000,
		paidAmount: 0,
		status: "UNPAID",
		dueDate: "2026-09-10",
		createdAt: "2026-09-01T00:00:00Z",
		transactions: [],
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

// Sprint E Fixtures: E-Wallets, Confirmations, Withdrawals, Merchants
export const mockEwallets: AdminEwalletItem[] = [
	{
		id: 1,
		accountNumber: "EW-202407001",
		ownerName: "Muhammad Farel Rabbani (Santri)",
		ownerType: "SANTRI",
		balance: 450000,
		status: "ACTIVE",
		lastTransactionAt: "2026-09-12T14:20:00Z",
	},
	{
		id: 2,
		accountNumber: "EW-MERCH-001",
		ownerName: "Kantin Kejujuran Putra (Merchant)",
		ownerType: "MERCHANT",
		balance: 2850000,
		status: "ACTIVE",
		lastTransactionAt: "2026-09-14T09:00:00Z",
	},
]

export const mockBankConfirmations: BankTransferConfirmationItem[] = [
	{
		id: 1,
		ewalletAccountId: 1,
		ownerName: "Muhammad Farel Rabbani",
		bankName: "Bank Syariah Indonesia (BSI)",
		accountHolder: "Ahmad Fauzi",
		amount: 500000,
		proofImageUrl: "https://placehold.co/600x400/emerald/white?text=Bukti+Transfer+BSI",
		requestedAt: "2026-09-13T16:00:00Z",
		status: "PENDING",
	},
]

export const mockWithdrawals: WithdrawalRequestItem[] = [
	{
		id: 1,
		ewalletAccountId: 2,
		ownerName: "Kantin Kejujuran Putra",
		amount: 1000000,
		cashierName: "Koperasi & Kasir Utama",
		status: "PENDING",
		requestedAt: "2026-09-14T08:00:00Z",
	},
]

export const mockMerchants: AdminMerchantItem[] = [
	{
		id: 1,
		businessName: "Kantin Kejujuran Putra",
		ownerName: "H. Ridwan Kamil",
		email: "kantin.putra@pondokroja.ac.id",
		phone: "081399887766",
		qrCodePayload: "ROJA-MERCH-001-KANTIN-PUTRA",
		isActive: true,
		createdAt: "2026-01-10T00:00:00Z",
	},
]

export const mockStudentCosts: StudentCostItem[] = [
	{
		id: 1,
		name: "SPP Syahriah",
		code: "SPP-7",
		category: "SPP",
		amount: 650000,
		academicYearId: 1,
		academicYearName: "2024/2025 - Genap",
		gradeId: 1,
		gradeName: "Kelas 7",
		billingCycle: "MONTHLY",
		isActive: true,
	},

	{
		id: 2,
		name: "Uang Pangkal / Sarana Gedung",
		code: "UP-7",
		category: "Gedung",
		amount: 3500000,
		academicYearId: 1,
		academicYearName: "2024/2025 - Genap",
		gradeId: 1,
		gradeName: "Kelas 7",
		billingCycle: "ONCE",
		isActive: true,
	},
	{
		id: 3,
		name: "Paket Seragam & Kitab Kuning",
		code: "SRG-7",
		category: "Seragam",
		amount: 1200000,
		academicYearId: 1,
		academicYearName: "2024/2025 - Genap",
		gradeId: 1,
		gradeName: "Kelas 7",
		billingCycle: "YEARLY",
		isActive: true,
	},
]

export const mockStudentCapabilityMatrix: StudentCapabilityMatrixItem[] = [
	{
		studentId: 1,
		nis: "202407001",
		fullName: "Muhammad Farel Rabbani",
		gradeName: "Kelas 7",
		capabilities: [
			{ costItemId: 1, costName: "SPP Syahriah", nominal: 650000, discountPercent: 0, finalAmount: 650000 },
			{ costItemId: 2, costName: "Uang Pangkal", nominal: 3500000, discountPercent: 0, finalAmount: 3500000 },
			{ costItemId: 3, costName: "Seragam & Kitab", nominal: 1200000, discountPercent: 0, finalAmount: 1200000 },
		],
	},
	{
		studentId: 2,
		nis: "202407002",
		fullName: "Aisyah Nur Syafiqah",
		gradeName: "Kelas 7",
		capabilities: [
			{ costItemId: 1, costName: "SPP Syahriah", nominal: 650000, discountPercent: 50, finalAmount: 325000 },
			{ costItemId: 2, costName: "Uang Pangkal", nominal: 3500000, discountPercent: 20, finalAmount: 2800000 },
			{ costItemId: 3, costName: "Seragam & Kitab", nominal: 1200000, discountPercent: 0, finalAmount: 1200000 },
		],
	},
]

export const mockStudentTransactions: StudentTransactionItem[] = [
	{
		id: 1,
		transactionNumber: "TRX-202609-0001",
		invoiceNumber: "INV/2026/09/001",
		studentName: "Muhammad Farel Rabbani",
		nis: "202407001",
		gradeName: "Kelas 7",
		amount: 650000,
		paymentMethod: "CASH",
		cashierName: "Koperasi & Kasir Utama",
		paidAt: "2026-09-05T09:30:00Z",
		notes: "Pembayaran SPP September 2026 Tunai",
	},
	{
		id: 2,
		transactionNumber: "TRX-202609-0002",
		invoiceNumber: "INV/2026/09/003",
		studentName: "Muhammad Farel Rabbani",
		nis: "202407001",
		gradeName: "Kelas 7",
		amount: 1200000,
		paymentMethod: "EWALLET",
		cashierName: "Koperasi & Kasir Utama",
		paidAt: "2026-09-07T14:10:00Z",
		notes: "Pembayaran Seragam & Kitab via E-Wallet",
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
