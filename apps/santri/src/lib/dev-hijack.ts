import type {
	SantriApi,
	SantriLoginDto,
	SantriLoginResponse,
	SantriTwoFactorDto,
	SantriForgotPasswordDto,
	SantriResetPasswordDto,
	SantriUpdateEmailDto,
	SantriEmailStatusResponse,
} from "@roja/api-client/src/domains/santri.api"
import type { AuthUser, Student, Ewallet, EwalletTransaction, StudentInvoice } from "@roja/types"

export const IS_DEV_HIJACK =
	import.meta.env.VITE_DEV_HIJACK == "true" ||
	(import.meta.env.DEV && import.meta.env.VITE_DEV_HIJACK != "false")

export const isDevHijackMode = (): boolean => IS_DEV_HIJACK

export const hijackAuthUser: AuthUser = {
	id: 101,
	email: "santri@pondokroja.ac.id",
	name: "Ahmad Mujtaba",
	role: "santri",
	domain: "santri",
}

export const mockStudentProfile: Student = {
	id: 101,
	nis: "2026001",
	fullName: "Ahmad Mujtaba",
	email: "santri@pondokroja.ac.id",
	emailVerifiedAt: "2026-01-10T08:00:00Z",
	gender: "male",
	isActive: true,
	gradeId: 1,
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
}

export const mockEwallet: Ewallet = {
	id: 501,
	uniqueNumber: "EW-2026001",
	totalSaldo: 350000,
	isActive: true,
	ewalletableId: 101,
	ewalletableType: "Student",
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
}

export const mockTransactions: EwalletTransaction[] = [
	{
		id: 1,
		ewalletId: 501,
		code: "TRX-001",
		name: "Pembelian Kantin Utama",
		type: "purchase",
		amount: 15000,
		status: "valid",
		paymentMethod: "E-Wallet PIN",
		paymentAccount: null,
		transferNewsNumber: null,
		attachment: null,
		createdAt: "2026-09-04T10:30:00Z",
		updatedAt: "2026-09-04T10:30:00Z",
	},
	{
		id: 2,
		ewalletId: 501,
		code: "TRX-002",
		name: "Top-Up Saldo E-Wallet via Transfer Bank",
		type: "income",
		amount: 200000,
		status: "valid",
		paymentMethod: "Bank Transfer",
		paymentAccount: "BSI 7192852646",
		transferNewsNumber: "TOPUP-2026001",
		attachment: "/assets/sample-receipt.png",
		createdAt: "2026-09-01T14:00:00Z",
		updatedAt: "2026-09-01T14:00:00Z",
	},
]

export const mockInvoices: StudentInvoice[] = [
	{
		id: 1001,
		studentId: 101,
		name: "SPP Bulan September 2026",
		amount: 750000,
		amountPaid: 750000,
		status: "paid",
		dueDate: "2026-09-10",
		createdAt: "2026-09-01T00:00:00Z",
		updatedAt: "2026-09-02T09:15:00Z",
	},
	{
		id: 1002,
		studentId: 101,
		name: "SPP Bulan Oktober 2026",
		amount: 750000,
		amountPaid: 0,
		status: "unpaid",
		dueDate: "2026-10-10",
		createdAt: "2026-09-01T00:00:00Z",
		updatedAt: "2026-09-01T00:00:00Z",
	},
]

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockSantriAuth = {
	login: (nis: string): SantriLoginResponse => {
		if (nis === "2026002") {
			return {
				requires2fa: true,
				studentId: 102,
				email: "santri2fa@pondokroja.ac.id",
			}
		}
		return {
			requires2fa: false,
			accessToken: "mock-santri-access-token",
			refreshToken: "mock-santri-refresh-token",
			user: {
				id: 101,
				nis,
				email: "santri@pondokroja.ac.id",
			},
		}
	},
	verify2fa: (code: string): SantriLoginResponse => {
		return {
			requires2fa: false,
			accessToken: "mock-santri-access-token-2fa",
			refreshToken: "mock-santri-refresh-token-2fa",
			user: {
				id: 102,
				nis: "2026002",
				email: "santri2fa@pondokroja.ac.id",
			},
		}
	},
}

export const hijackSantriApi = (realApi: SantriApi): SantriApi => {
	if (!IS_DEV_HIJACK) return realApi

	return {
		login: async (data: SantriLoginDto): Promise<SantriLoginResponse> => {
			await delay(400)
			return mockSantriAuth.login(data.nis)
		},
		verify2fa: async (data: SantriTwoFactorDto, studentId: number): Promise<SantriLoginResponse> => {
			await delay(300)
			return mockSantriAuth.verify2fa(data.code)
		},
		resend2fa: async (studentId: number): Promise<{ message: string }> => {
			await delay(200)
			return { message: "Kode verifikasi 2FA baru telah dikirim ke email Anda." }
		},
		forgotPassword: async (data: SantriForgotPasswordDto): Promise<{ message: string }> => {
			await delay(300)
			return { message: "Jika email terdaftar, instruksi reset password telah dikirim ke email Anda." }
		},
		resetPassword: async (data: SantriResetPasswordDto): Promise<{ message: string }> => {
			await delay(300)
			return { message: "Password berhasil diperbarui. Silakan login kembali." }
		},
		sendEmailVerification: async (): Promise<{ message: string }> => {
			await delay(200)
			return { message: "Email verifikasi telah dikirim." }
		},
		verifyEmail: async (id: number, hash: string): Promise<{ message: string }> => {
			await delay(200)
			return { message: "Email berhasil diverifikasi." }
		},
		getEmail: async (): Promise<SantriEmailStatusResponse> => {
			await delay(200)
			return {
				id: 101,
				nis: "2026001",
				email: "santri@pondokroja.ac.id",
				emailVerifiedAt: "2026-01-10T08:00:00Z",
			}
		},
		updateEmail: async (data: SantriUpdateEmailDto): Promise<{ message: string }> => {
			await delay(200)
			return { message: "Email berhasil diperbarui. Silakan cek email Anda untuk verifikasi." }
		},
		logout: async (): Promise<{ message: string }> => {
			await delay(200)
			return { message: "Berhasil keluar." }
		},
		getProfile: async () => {
			await delay(200)
			return mockStudentProfile
		},
		getEwallet: async () => {
			await delay(200)
			return mockEwallet
		},
		getEwalletStatus: async () => {
			await delay(200)
			return {
				hasEwallet: true,
				isActive: true,
			}
		},
		loginEwalletPin: async (pin: string) => {
			await delay(300)
			if (pin === "123456") {
				return { success: true, message: "PIN Berhasil" }
			}
			throw new Error("PIN yang kamu masukkan salah")
		},
		validatePrevPin: async (pin: string) => {
			await delay(300)
			if (pin === "123456") {
				return { success: true, message: "PIN Lama Valid" }
			}
			throw new Error("PIN lama yang kamu masukkan salah")
		},
		updatePin: async (data) => {
			await delay(300)
			if (data.pin !== data.pinConfirmation) {
				throw new Error("Konfirmasi PIN baru tidak cocok")
			}
			return { success: true, message: "PIN berhasil diperbarui" }
		},
		createEwallet: async (data) => {
			await delay(300)
			if (data.pin !== data.pinConfirmation) {
				throw new Error("Konfirmasi PIN tidak cocok")
			}
			return { success: true, message: "Dompet Digital berhasil dibuat" }
		},
		getEwalletDashboard: async () => {
			await delay(300)
			return {
				totalSaldo: mockEwallet.totalSaldo,
				transactions: mockTransactions,
			}
		},
		getTransactionDetail: async (id: number) => {
			await delay(300)
			const tx = mockTransactions.find((t) => t.id === Number(id)) || mockTransactions[0]
			return {
				...tx,
				paymentNote: "Catatan: Pembelian di kantin santri utama",
				bankAccount: "BSI 7123456789 (a.n. Pondok ROJA)",
				invalidNote: tx.status === "invalid" ? "Bukti transfer tidak terbaca atau nominal tidak sesuai." : undefined,
			}
		},
		getTransactions: async () => {
			await delay(300)
			return mockTransactions
		},
		getInvoices: async () => {
			await delay(300)
			return mockInvoices
		},
		getInvoiceDetail: async (id: number) => {
			await delay(300)
			const inv = mockInvoices.find((i) => i.id === Number(id)) || mockInvoices[0]
			return {
				...inv,
				note: "Pembayaran SPP mencakup biaya pendidikan, kegiatan ekstrakurikuler, dan fasilitas pondok.",
				studentName: mockStudentProfile.fullName,
				studentNis: mockStudentProfile.nis,
				costRemain: inv.amount - inv.amountPaid,
				transactions: inv.amountPaid > 0 ? [
					{
						id: 991,
						desc: "Pembayaran SPP via E-Wallet PIN",
						paidAt: "2026-09-02T09:15:00Z",
						amount: inv.amountPaid,
					}
				] : [],
			}
		},
		updateAccountSettings: async (data) => {
			await delay(400)
			mockStudentProfile.email = data.email
			return { message: "Pengaturan akun berhasil diperbarui." }
		},
		updateTwoFactor: async (data) => {
			await delay(400)
			return { message: data.enabled2fa === 1 ? "Fitur 2FA berhasil diaktifkan." : "Fitur 2FA berhasil dinonaktifkan." }
		},
		resendSettingEmailVerification: async () => {
			await delay(400)
			return { message: "Link verifikasi telah dikirim ulang ke email kamu." }
		},
	}
}
