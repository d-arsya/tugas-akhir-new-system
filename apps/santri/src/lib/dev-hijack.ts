import type { SantriApi, SantriLoginDto, SantriLoginResponse } from "@roja/api-client/src/domains/santri.api"
import type { AuthUser, Student, Ewallet, EwalletTransaction, StudentInvoice } from "@roja/types"

export const IS_DEV_HIJACK =
	import.meta.env.VITE_DEV_HIJACK === "true" ||
	(import.meta.env.DEV && import.meta.env.VITE_DEV_HIJACK !== "false")

export const hijackAuthUser: AuthUser = {
	id: 101,
	email: "santri@pondokroja.ac.id",
	name: "Ahmad Mujtaba",
	role: "student",
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
		paymentAccount: "BSI 7123456789",
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

export const hijackSantriApi = (realApi: SantriApi): SantriApi => {
	if (!IS_DEV_HIJACK) return realApi

	return {
		login: async (data: SantriLoginDto): Promise<SantriLoginResponse> => {
			await delay(400)
			if (data.nis === "2026002") {
				return { requires2fa: true, email: "santri2fa@pondokroja.ac.id" }
			}
			return {
				requires2fa: false,
				tokens: { accessToken: "mock-santri-access-token", refreshToken: "mock-santri-refresh-token" },
				user: hijackAuthUser,
			}
		},
		verify2fa: async () => {
			await delay(300)
			return {
				tokens: { accessToken: "mock-santri-access-token", refreshToken: "mock-santri-refresh-token" },
				user: hijackAuthUser,
			}
		},
		logout: async () => {
			await delay(200)
		},
		getProfile: async () => {
			await delay(200)
			return mockStudentProfile
		},
		getEwallet: async () => {
			await delay(200)
			return mockEwallet
		},
		getTransactions: async () => {
			await delay(300)
			return mockTransactions
		},
		getInvoices: async () => {
			await delay(300)
			return mockInvoices
		},
	}
}
