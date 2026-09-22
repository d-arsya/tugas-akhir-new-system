import { getRuntimeEnv } from "@roja/utils"
import type {
	MerchantApi,
	MerchantLoginDto,
	MerchantLoginResponse,
	MerchantTwoFactorDto,
	MerchantForgotPasswordDto,
	MerchantResetPasswordDto,
	MerchantCreateEwalletDto,
	StoreTransactionDto,
	CheckoutDataResponse,
	UpdateProfileDto,
	ChangePasswordDto,
} from "@roja/api-client/src/domains/merchant.api"
import {
	hijackAuthUser,
	mockMerchantProfile,
	mockEwallet,
	mockTransactions,
} from "./dev-hijack.fixtures"

export { hijackAuthUser }

export const IS_DEV_HIJACK =
	getRuntimeEnv("VITE_DEV_HIJACK") === "true" ||
	(import.meta.env.DEV && getRuntimeEnv("VITE_DEV_HIJACK") !== "false")

export const isDevHijackMode = (): boolean => IS_DEV_HIJACK

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

let activeMockTxn = {
	id: 101,
	code: "PRC-20260912-8812",
	status: "valid",
	totalAmount: 45000,
	buyerName: "Ahmad Mujtaba",
	buyerEwalletId: 501,
	items: [
		{ id: 1, description: "Nasi Goreng Special", price: 25000 },
		{ id: 2, description: "Es Teh Manis Jumbo", price: 20000 },
	],
	scanned: false,
}

let pinAttempts = 0

export const hijackMerchantApi = (realApi: MerchantApi): MerchantApi => {
	if (!IS_DEV_HIJACK) return realApi

	return {
		login: async (data: MerchantLoginDto): Promise<MerchantLoginResponse> => {
			await delay(400)
			if (data.uniqueNumber === "MRC-2026-002" || data.uniqueNumber === "2fa") {
				return { requires2fa: true, merchantId: 302, email: "merchant2fa@pondokroja.ac.id" }
			}
			return {
				requires2fa: false,
				accessToken: "mock-merchant-access-token",
				refreshToken: "mock-merchant-refresh-token",
				user: { ...hijackAuthUser, name: `Merchant (${data.uniqueNumber})` },
			}
		},
		verify2fa: async (data: MerchantTwoFactorDto, merchantId: number): Promise<MerchantLoginResponse> => {
			await delay(300)
			return {
				requires2fa: false,
				accessToken: "mock-merchant-access-token-2fa",
				refreshToken: "mock-merchant-refresh-token-2fa",
				user: { ...hijackAuthUser, id: merchantId },
			}
		},
		resend2fa: async () => {
			await delay(200)
			return { message: "Kode 2FA baru telah dikirimkan ke email terdaftar Anda." }
		},
		forgotPassword: async () => {
			await delay(300)
			return { message: "Instruksi reset password telah dikirim ke email Anda." }
		},
		resetPassword: async () => {
			await delay(300)
			return { message: "Password merchant berhasil diperbarui. Silakan login kembali." }
		},
		logout: async () => {
			await delay(200)
			return { message: "Berhasil keluar dari akun Merchant." }
		},
		getProfile: async () => {
			await delay(200)
			return mockMerchantProfile
		},
		getEwalletStatus: async () => {
			await delay(200)
			return { hasEwallet: true, isActive: true }
		},
		loginEwalletPin: async (pin: string) => {
			await delay(300)
			if (pin === "123456") return { success: true, message: "PIN E-Wallet Valid" }
			throw new Error("PIN E-Wallet salah! Sisa kesempatan: 2x")
		},
		createEwallet: async (data: MerchantCreateEwalletDto) => {
			await delay(300)
			if (data.pin !== data.pinConfirmation) throw new Error("Konfirmasi PIN tidak cocok")
			return { success: true, message: "Dompet Digital Merchant berhasil diaktifkan" }
		},
		getEwalletDashboard: async () => {
			await delay(300)
			return { totalSaldo: mockEwallet.totalSaldo, transactions: mockTransactions }
		},

		// Transaction Methods
		createTransaction: async (data: StoreTransactionDto) => {
			await delay(300)
			const total = data.items.reduce((sum, item) => sum + item.price, 0)
			activeMockTxn = {
				id: Math.floor(100 + Math.random() * 900),
				code: `PRC-20260912-${Math.floor(1000 + Math.random() * 9000)}`,
				status: "waiting",
				totalAmount: total,
				buyerName: "Ahmad Mujtaba",
				buyerEwalletId: 501,
				items: data.items.map((item, idx) => ({ id: idx + 1, description: item.description, price: item.price })),
				scanned: false,
			}
			pinAttempts = 0
			return { transactionId: activeMockTxn.id, code: activeMockTxn.code }
		},
		getQRPageData: async (id: number) => {
			await delay(200)
			return {
				transactionId: id,
				code: activeMockTxn.code,
				totalAmount: activeMockTxn.totalAmount,
				merchantUniqueNumber: mockMerchantProfile.uniqueNumber,
			}
		},
		validateScan: async (id: number) => {
			await delay(300)
			activeMockTxn.scanned = true
			return { transactionId: id, studentName: "Ahmad Mujtaba" }
		},
		getCheckoutData: async (id: number): Promise<CheckoutDataResponse> => {
			await delay(200)
			return {
				id,
				code: activeMockTxn.code,
				status: activeMockTxn.status,
				totalAmount: activeMockTxn.totalAmount,
				buyerName: activeMockTxn.buyerName,
				buyerEwalletId: activeMockTxn.buyerEwalletId,
				items: activeMockTxn.items,
			}
		},
		updateTransactionItem: async (itemId: number, data: { description: string; price: number }) => {
			await delay(200)
			const item = activeMockTxn.items.find((i) => i.id === itemId)
			if (item) {
				item.description = data.description
				item.price = data.price
			}
			activeMockTxn.totalAmount = activeMockTxn.items.reduce((s, i) => s + i.price, 0)
			return { success: true, totalAmount: activeMockTxn.totalAmount }
		},
		validatePin: async (transactionId: number, pin: string) => {
			await delay(400)
			if (pin === "123456") {
				activeMockTxn.status = "valid"
				return { success: true, message: "Pembayaran berhasil dikonfirmasi!" }
			}
			pinAttempts += 1
			if (pinAttempts >= 3) {
				return { blocked: true, message: "Terlalu banyak percobaan. E-Wallet pembeli dinonaktifkan." }
			}
			return { wrongPin: true, attempts: pinAttempts, message: `PIN salah! Sisa kesempatan: ${3 - pinAttempts}x.` }
		},
		getTransactions: async () => {
			await delay(300)
			return mockTransactions
		},
		getTransactionDetail: async (id: number) => {
			await delay(300)
			const tx = mockTransactions.find((t) => t.id === Number(id)) || mockTransactions[0]
			return {
				...tx,
				items: activeMockTxn.items,
				buyerName: "Ahmad Mujtaba",
			}
		},

		// Profile & Settings
		updateProfile: async (data: UpdateProfileDto) => {
			await delay(400)
			mockMerchantProfile.merchantName = data.merchantName
			mockMerchantProfile.phone = data.phone
			mockMerchantProfile.address = data.address
			return { message: "Profil merchant berhasil diperbarui." }
		},
		changePassword: async () => {
			await delay(300)
			return { message: "Password berhasil diubah. Silakan login kembali saat sesi berakhir." }
		},
		toggle2fa: async (enabled: boolean) => {
			await delay(300)
			mockMerchantProfile.enabled2fa = enabled
			return { message: enabled ? "Fitur 2FA berhasil diaktifkan." : "Fitur 2FA berhasil dinonaktifkan." }
		},
		resendVerification: async () => {
			await delay(300)
			return { message: "Email verifikasi baru telah dikirimkan ke email terdaftar Anda." }
		},
		confirmTopUp: async () => {
			await delay(400)
			return { message: "Bukti transfer berhasil diunggah. Menunggu verifikasi admin." }
		},
		updatePin: async (data) => {
			await delay(300)
			if (data.pin !== data.pinConfirmation) throw new Error("Konfirmasi PIN baru tidak cocok")
			return { message: "PIN E-Wallet berhasil diperbarui." }
		},
		resetPin: async (data) => {
			await delay(300)
			if (data.pin !== data.pinConfirmation) throw new Error("Konfirmasi PIN baru tidak cocok")
			return { message: "PIN E-Wallet berhasil di-reset via email." }
		},
	}
}
