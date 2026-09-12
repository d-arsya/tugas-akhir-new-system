import type { AxiosInstance } from "axios"
import type { AuthUser, Merchant, EwalletTransaction } from "@roja/types"

export type MerchantLoginDto = {
	uniqueNumber: string
	password: string
}

export type MerchantLoginResponse =
	| {
			requires2fa: true
			merchantId: number
			email: string | null
	  }
	| {
			requires2fa: false
			accessToken: string
			refreshToken: string
			user: AuthUser
	  }

export type MerchantTwoFactorDto = { code: string }
export type MerchantForgotPasswordDto = { email: string }
export type MerchantResetPasswordDto = {
	email: string
	token: string
	password: string
	passwordConfirmation: string
}

export type MerchantProfileResponse = Merchant
export type MerchantEwalletStatusResponse = { hasEwallet: boolean; isActive: boolean }
export type MerchantCreateEwalletDto = { pin: string; pinConfirmation: string }

export type StoreTransactionDto = {
	items: Array<{ description: string; price: number }>
}

export type CheckoutDataResponse = {
	id: number
	code: string
	status: string
	totalAmount: number
	buyerName: string
	buyerEwalletId: number
	items: Array<{ id: number; description: string; price: number }>
}

export type UpdateProfileDto = {
	merchantName: string
	phone: string
	address: string
}

export type ChangePasswordDto = {
	password: string
	passwordConfirmation: string
}

export type MerchantApi = {
	login: (data: MerchantLoginDto) => Promise<MerchantLoginResponse>
	verify2fa: (data: MerchantTwoFactorDto, merchantId: number) => Promise<MerchantLoginResponse>
	resend2fa: (merchantId: number) => Promise<{ message: string }>
	forgotPassword: (data: MerchantForgotPasswordDto) => Promise<{ message: string }>
	resetPassword: (data: MerchantResetPasswordDto) => Promise<{ message: string }>
	logout: () => Promise<{ message: string }>
	getProfile: () => Promise<MerchantProfileResponse>
	getEwalletStatus: () => Promise<MerchantEwalletStatusResponse>
	loginEwalletPin: (pin: string) => Promise<{ success: boolean; message: string }>
	createEwallet: (data: MerchantCreateEwalletDto) => Promise<{ success: boolean; message: string }>
	getEwalletDashboard: () => Promise<{ totalSaldo: number; transactions: EwalletTransaction[] }>

	// Transactions
	createTransaction: (data: StoreTransactionDto) => Promise<{ transactionId: number; code: string }>
	getQRPageData: (id: number) => Promise<{ transactionId: number; code: string; totalAmount: number; merchantUniqueNumber: string }>
	validateScan: (id: number, scannedQrValue: string) => Promise<{ transactionId: number; studentName: string }>
	getCheckoutData: (id: number) => Promise<CheckoutDataResponse>
	updateTransactionItem: (itemId: number, data: { description: string; price: number }) => Promise<{ success: boolean; totalAmount: number }>
	validatePin: (transactionId: number, pin: string) => Promise<{ success: boolean; message: string; wrongPin?: boolean; attempts?: number; blocked?: boolean }>
	getTransactions: () => Promise<EwalletTransaction[]>
	getTransactionDetail: (id: number) => Promise<EwalletTransaction & { items?: Array<{ id: number; description: string; price: number }>; buyerName?: string }>

	// Profile & Settings
	updateProfile: (data: UpdateProfileDto) => Promise<{ message: string }>
	changePassword: (data: ChangePasswordDto) => Promise<{ message: string }>
	toggle2fa: (enabled: boolean) => Promise<{ message: string }>
	resendVerification: () => Promise<{ message: string }>
	confirmTopUp: (id: number, formData: FormData) => Promise<{ message: string }>
	updatePin: (data: { currentPin: string; pin: string; pinConfirmation: string }) => Promise<{ message: string }>
	resetPin: (data: { email: string; token: string; pin: string; pinConfirmation: string }) => Promise<{ message: string }>
}

export const createMerchantApi = (client?: AxiosInstance): MerchantApi => {
	const c = client as AxiosInstance
	return {
		login: async (data) => (await c.post("/merchant/auth/login", data)).data.data,
		verify2fa: async (data, merchantId) => (await c.post(`/merchant/auth/2fa/verify?merchant_id=${merchantId}`, data)).data.data,
		resend2fa: async (merchantId) => (await c.get(`/merchant/auth/2fa/resend?merchant_id=${merchantId}`)).data,
		forgotPassword: async (data) => (await c.post("/merchant/auth/forgot-password", data)).data,
		resetPassword: async (data) => (await c.post("/merchant/auth/reset-password", data)).data,
		logout: async () => (await c.post("/merchant/auth/logout")).data,
		getProfile: async () => (await c.get("/merchant/profile")).data.data,
		getEwalletStatus: async () => (await c.get("/merchant/ewallet/status")).data.data,
		loginEwalletPin: async (pin) => (await c.post("/merchant/ewallet/pin/login", { pin })).data.data,
		createEwallet: async (data) => (await c.post("/merchant/ewallet/pin/create", data)).data.data,
		getEwalletDashboard: async () => (await c.get("/merchant/ewallet")).data.data,

		// Transactions
		createTransaction: async (data) => (await c.post("/merchant/transactions", data)).data.data,
		getQRPageData: async (id) => (await c.get(`/merchant/transactions/${id}/scan-qr`)).data.data,
		validateScan: async (id, scannedQrValue) => (await c.post(`/merchant/transactions/${id}/validate-scan`, { scannedQrValue })).data.data,
		getCheckoutData: async (id) => (await c.get(`/merchant/transactions/${id}/checkout`)).data.data,
		updateTransactionItem: async (itemId, data) => (await c.patch(`/merchant/transactions/items/${itemId}`, data)).data.data,
		validatePin: async (transactionId, pin) => (await c.post(`/merchant/transactions/${transactionId}/validate-pin`, { pin })).data.data,
		getTransactions: async () => (await c.get("/merchant/transactions")).data.data,
		getTransactionDetail: async (id) => (await c.get(`/merchant/transactions/${id}`)).data.data,

		// Settings & Profile
		updateProfile: async (data) => (await c.patch("/merchant/setting/profile", data)).data,
		changePassword: async (data) => (await c.patch("/merchant/setting/password", data)).data,
		toggle2fa: async (enabled) => (await c.patch("/merchant/setting/2fa", { enabled })).data,
		resendVerification: async () => (await c.get("/merchant/setting/email/resend")).data,
		confirmTopUp: async (id, formData) => (await c.patch(`/merchant/ewallet/top-up/confirm/${id}`, formData)).data,
		updatePin: async (data) => (await c.patch("/merchant/ewallet/pin", data)).data,
		resetPin: async (data) => (await c.patch("/merchant/ewallet/pin/reset", data)).data,
	}
}
