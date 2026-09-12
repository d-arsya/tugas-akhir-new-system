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
	transactionId: number
	code: string
	status: string
	totalAmount: number
	totalPrice: number
	buyerName: string
	buyerEwalletId?: number
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

export type MerchantTransactionFilterParams = {
	page?: number
	limit?: number
	status?: string
	search?: string
	dateStart?: string
	dateEnd?: string
}

export type MerchantEwalletDashboardResponse = {
	totalBalance: number
	totalSaldo: number
	ewallet?: {
		id: number
		uniqueId: string | null
		merchantName: string | null
		isActive: boolean | null
	}
	transactions: EwalletTransaction[]
	meta?: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export type MerchantValidatePinResponse = {
	success?: boolean
	message: string
	wrongPin?: boolean
	isWrongPin?: boolean
	attempts?: number
	remainingAttempts?: number
	blocked?: boolean
	isBlocked?: boolean
	insufficientBalance?: boolean
	isBalanceInsufficient?: boolean
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
	getEwalletDashboard: (params?: MerchantTransactionFilterParams) => Promise<MerchantEwalletDashboardResponse>

	// Transactions
	createTransaction: (data: StoreTransactionDto) => Promise<{ transactionId: number; code: string; totalAmount?: number; message?: string }>
	getQRPageData: (id: number) => Promise<{ transactionId: number; code: string; totalAmount: number; amount?: number; merchantUniqueNumber: string }>
	validateScan: (id: number, scannedQrValue: string) => Promise<{ transactionId: number; studentName?: string; message?: string }>
	getCheckoutData: (id: number) => Promise<CheckoutDataResponse>
	updateTransactionItem: (itemId: number, data: { description: string; price: number }) => Promise<{ success: boolean; totalAmount: number; currentTotal?: number; message?: string }>
	validatePin: (transactionId: number, pin: string) => Promise<MerchantValidatePinResponse>
	getTransactions: (params?: MerchantTransactionFilterParams) => Promise<EwalletTransaction[]>
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
		login: async (data) => {
			const res = (await c.post("/merchant/auth/login", data)).data
			const payload = res.data ?? res
			if (payload.user && !payload.user.domain) {
				payload.user.domain = "merchant"
			}
			return payload
		},
		verify2fa: async (data, merchantId) => {
			const res = (await c.post(`/merchant/auth/2fa/verify?merchant_id=${merchantId}`, data)).data
			const payload = res.data ?? res
			if (payload.user && !payload.user.domain) {
				payload.user.domain = "merchant"
			}
			return payload
		},
		resend2fa: async (merchantId) => (await c.get(`/merchant/auth/2fa/resend?merchant_id=${merchantId}`)).data,
		forgotPassword: async (data) => (await c.post("/merchant/auth/forgot-password", data)).data,
		resetPassword: async (data) => (await c.post("/merchant/auth/reset-password", data)).data,
		logout: async () => (await c.post("/merchant/auth/logout")).data,
		getProfile: async () => (await c.get("/merchant/profile")).data.data,
		getEwalletStatus: async () => (await c.get("/merchant/ewallet/status")).data.data,
		loginEwalletPin: async (pin) => {
			const res = (await c.post("/merchant/ewallet/pin/login", { pin })).data
			return { success: true, message: res.message || "PIN terverifikasi" }
		},
		createEwallet: async (data) => {
			const res = (await c.post("/merchant/ewallet/pin/create", data)).data
			return { success: true, message: res.message || "E-Wallet berhasil dibuat" }
		},
		getEwalletDashboard: async (params) => {
			const res = (await c.get("/merchant/ewallet", { params })).data
			const raw = res.data ?? res
			const total = Number(raw.totalBalance ?? raw.totalSaldo ?? 0)
			return {
				totalBalance: total,
				totalSaldo: total,
				ewallet: raw.ewallet,
				transactions: Array.isArray(raw.transactions) ? raw.transactions : [],
				meta: res.meta,
			}
		},

		// Transactions
		createTransaction: async (data) => (await c.post("/merchant/transactions", data)).data.data,
		getQRPageData: async (id) => {
			const raw = (await c.get(`/merchant/transactions/${id}/scan-qr`)).data.data
			const total = Number(raw.amount ?? raw.totalAmount ?? 0)
			return {
				transactionId: raw.transactionId ?? id,
				code: raw.code,
				totalAmount: total,
				amount: total,
				merchantUniqueNumber: raw.merchantUniqueNumber || "",
			}
		},
		validateScan: async (id, scannedQrValue) => (await c.post(`/merchant/transactions/${id}/validate-scan`, { scannedQrValue })).data.data,
		getCheckoutData: async (id) => {
			const raw = (await c.get(`/merchant/transactions/${id}/checkout`)).data.data
			const total = Number(raw.totalPrice ?? raw.totalAmount ?? 0)
			return {
				id: raw.transactionId ?? raw.id ?? id,
				transactionId: raw.transactionId ?? raw.id ?? id,
				code: raw.code,
				status: raw.status || "waiting",
				totalAmount: total,
				totalPrice: total,
				buyerName: raw.buyerName || "Santri",
				buyerEwalletId: raw.buyerEwalletId,
				items: Array.isArray(raw.items) ? raw.items : [],
			}
		},
		updateTransactionItem: async (itemId, data) => {
			const res = (await c.patch(`/merchant/transactions/items/${itemId}`, data)).data
			const raw = res.data ?? res
			const total = Number(raw.currentTotal ?? raw.totalAmount ?? 0)
			return {
				success: true,
				totalAmount: total,
				currentTotal: total,
				message: res.message || "Item berhasil diperbarui",
			}
		},
		validatePin: async (transactionId, pin) => {
			const res = (await c.post(`/merchant/transactions/${transactionId}/validate-pin`, { pin })).data
			const raw = res.data ?? res
			const isWrong = Boolean(raw.wrongPin || raw.isWrongPin)
			const isBlocked = Boolean(raw.blocked || raw.isBlocked)
			const isInsufficient = Boolean(raw.insufficientBalance || raw.isBalanceInsufficient)
			const isSuccess = Boolean(raw.success || (!isWrong && !isBlocked && !isInsufficient))

			return {
				success: isSuccess,
				message: res.message || raw.message || (isSuccess ? "Pembayaran berhasil dikonfirmasi" : "Gagal memproses"),
				wrongPin: isWrong,
				isWrongPin: isWrong,
				blocked: isBlocked,
				isBlocked,
				insufficientBalance: isInsufficient,
				isBalanceInsufficient: isInsufficient,
				attempts: raw.attempts,
				remainingAttempts: raw.remainingAttempts,
			}
		},
		getTransactions: async (params) => {
			const res = (await c.get("/merchant/transactions", { params })).data
			return Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
		},
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

