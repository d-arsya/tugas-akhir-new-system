import type { AxiosInstance } from "axios"
import type {
	AuthUser,
	ApiResponse,
	Student,
	Ewallet,
	EwalletTransaction,
	StudentInvoice,
} from "@roja/types"

export type SantriLoginDto = {
	nis: string
	password: string
}

export type SantriLoginResponse =
	| {
		requires2fa: true
		studentId: number
		email: string | null
	}
	| {
		requires2fa: false
		accessToken: string
		refreshToken: string
		user: AuthUser
	}

export type SantriTwoFactorDto = {
	code: string
}

export type SantriForgotPasswordDto = {
	email: string
}

export type SantriResetPasswordDto = {
	email: string
	token: string
	password: string
	passwordConfirmation: string
}

export type SantriUpdateEmailDto = {
	email: string
}

export type SantriEmailStatusResponse = {
	id: number
	nis: string | null
	email: string | null
	emailVerifiedAt: string | null
}

export type SantriEwalletStatusResponse = {
	hasEwallet: boolean
	isActive: boolean
}

export type SantriCreateEwalletDto = {
	pin: string
	pinConfirmation: string
}

export type SantriEwalletDashboardResponse = {
	totalBalance: number
	transactions: EwalletTransaction[]
}

export type SantriValidateCurrentPinDto = {
	pin: string
}

export type SantriUpdatePinDto = {
	prevPin: string
	pin: string
	pinConfirmation: string
}

export type SantriResetPinDto = {
	token: string
	pin: string
	pinConfirmation: string
}

export type SantriTransactionDetailResponse = EwalletTransaction & {
	invalidNote?: string
	paymentNote?: string
	bankAccount?: string
}

export type SantriInvoiceTransactionItem = {
	id: number
	desc: string
	paidAt: string
	amount: number
}

export type PaginationMeta = {
	page: number
	limit: number
	total: number
	totalPages: number
}

export type SantriInvoiceDetailResponse = StudentInvoice & {
	note?: string
	student: {
		id: number
		nis: string | null
		fullName: string
	}
	studentName: string
	studentNis: string
	transactions: SantriInvoiceTransactionItem[]
	costRemain: number
	totalPaid: number
	meta?: PaginationMeta
}

export type SantriPaymentSummaryResponse = {
	totalBilled: number
	totalPaid: number
	remaining: number
	invoices: StudentInvoice[]
}

export type SantriChangePasswordDto = {
	password: string
	passwordConfirmation: string
}

export type SantriToggle2faDto = {
	enabled: boolean
}

export type SantriSettingPageResponse = {
	email: string | null
	emailVerifiedAt: string | null
	enabled2fa: boolean
}

export type SantriTopUpBankTransferDto = {
	amount: number
}

export type SantriApi = {
	login: (data: SantriLoginDto) => Promise<SantriLoginResponse>
	verify2fa: (data: SantriTwoFactorDto, studentId: number) => Promise<SantriLoginResponse>
	resend2fa: (studentId: number) => Promise<{ message: string }>
	forgotPassword: (data: SantriForgotPasswordDto) => Promise<{ message: string }>
	resetPassword: (data: SantriResetPasswordDto) => Promise<{ message: string }>
	sendEmailVerification: () => Promise<{ message: string }>
	verifyEmail: (id: number, hash: string) => Promise<{ message: string }>
	getEmail: () => Promise<SantriEmailStatusResponse>
	updateEmail: (data: SantriUpdateEmailDto) => Promise<{ message: string }>
	logout: () => Promise<{ message: string }>
	refreshToken: () => Promise<{ success: boolean }>
	getProfile: () => Promise<Student & { gradeName?: string; school?: any }>
	getEwalletStatus: () => Promise<SantriEwalletStatusResponse>
	loginEwalletPin: (pin: string) => Promise<{ message: string }>
	createEwallet: (data: SantriCreateEwalletDto) => Promise<{ message: string }>
	showInactivePage: () => Promise<{ message: string }>
	getEwalletDashboard: (params?: { page?: number; limit?: number; status?: string; search?: string; dateStart?: string; dateEnd?: string }) => Promise<SantriEwalletDashboardResponse>
	validateCurrentPin: (pin: string) => Promise<{ message: string }>
	updatePin: (data: SantriUpdatePinDto) => Promise<{ message: string }>
	sendPinResetEmail: () => Promise<{ message: string }>
	validatePinResetToken: (token: string) => Promise<{ message: string }>
	resetPin: (data: SantriResetPinDto) => Promise<{ message: string }>
	getTransactions: (params?: Record<string, any>) => Promise<EwalletTransaction[]>
	getTransactionDetail: (id: number) => Promise<SantriTransactionDetailResponse>
	getTopUpBankInfo: () => Promise<any>
	storeTopUpBankTransfer: (data: SantriTopUpBankTransferDto) => Promise<{
		transactionId: number
		code: string
		amount: number
		transferNewsNumber: number
		totalAmount: number
		paymentAccount: string
		paymentOnBehalfOf: string
		message: string
	}>
	getConfirmForm: (id: number) => Promise<SantriTransactionDetailResponse>
	confirmTopUp: (id: number, formData: FormData) => Promise<{ message: string }>
	getPaymentSummary: (params?: { page?: number; limit?: number; status?: string; search?: string }) => Promise<SantriPaymentSummaryResponse>
	getInvoiceList: (studentId: number, params?: { page?: number; limit?: number }) => Promise<StudentInvoice[]>
	getInvoiceDetail: (invoiceId: number, params?: { page?: number; limit?: number }) => Promise<SantriInvoiceDetailResponse>
	getSettingPage: () => Promise<SantriSettingPageResponse>
	changePassword: (data: SantriChangePasswordDto) => Promise<{ message: string }>
	toggle2fa: (data: SantriToggle2faDto) => Promise<{ message: string }>
	resendSettingEmailVerification: () => Promise<{ message: string }>
}

export const createSantriApi = (client: AxiosInstance): SantriApi => ({
	login: async (data): Promise<SantriLoginResponse> => {
		const { data: res } = await client.post<ApiResponse<SantriLoginResponse>>("/santri/auth/login", data)
		return res.data
	},
	verify2fa: async (data, studentId): Promise<SantriLoginResponse> => {
		const { data: res } = await client.post<ApiResponse<SantriLoginResponse>>(
			`/santri/auth/2fa/verify?student_id=${studentId}`,
			data,
		)
		return res.data
	},
	resend2fa: async (studentId): Promise<{ message: string }> => {
		const { data: res } = await client.get<ApiResponse<{ message: string }>>(
			`/santri/auth/2fa/resend?student_id=${studentId}`,
		)
		return res.data
	},
	forgotPassword: async (data): Promise<{ message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ message: string }>>(
			"/santri/auth/forgot-password",
			data,
		)
		return res.data
	},
	resetPassword: async (data): Promise<{ message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ message: string }>>(
			"/santri/auth/reset-password",
			data,
		)
		return res.data
	},
	sendEmailVerification: async (): Promise<{ message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ message: string }>>(
			"/santri/auth/email/verify/send",
		)
		return res.data
	},
	verifyEmail: async (id, hash): Promise<{ message: string }> => {
		const { data: res } = await client.get<ApiResponse<{ message: string }>>(
			`/santri/auth/email/verify/${id}/${hash}`,
		)
		return res.data
	},
	getEmail: async (): Promise<SantriEmailStatusResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriEmailStatusResponse>>(
			"/santri/auth/check-email",
		)
		return res.data
	},
	updateEmail: async (data): Promise<{ message: string }> => {
		const { data: res } = await client.patch<ApiResponse<{ message: string }>>(
			"/santri/auth/check-email",
			data,
		)
		return res.data
	},
	logout: async (): Promise<{ message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ message: string }>>("/santri/auth/logout")
		return res.data
	},
	refreshToken: async (): Promise<{ success: boolean }> => {
		const { data: res } = await client.post<ApiResponse<any>>("/santri/auth/refresh")
		return { success: res.success }
	},
	getProfile: async (): Promise<Student & { gradeName?: string; school?: any }> => {
		const { data: res } = await client.get<ApiResponse<Student>>("/santri/profile")
		return res.data
	},
	getEwalletStatus: async (): Promise<SantriEwalletStatusResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriEwalletStatusResponse>>("/santri/ewallet/status")
		return res.data
	},
	loginEwalletPin: async (pin: string): Promise<{ message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ message: string }>>("/santri/ewallet/pin/login", { pin })
		return res.data
	},
	createEwallet: async (data: SantriCreateEwalletDto): Promise<{ message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ message: string }>>("/santri/ewallet/pin/create", data)
		return res.data
	},
	showInactivePage: async (): Promise<{ message: string }> => {
		const { data: res } = await client.get<ApiResponse<{ message: string }>>("/santri/ewallet/inactive")
		return res.data
	},
	getEwalletDashboard: async (params?: { page?: number; limit?: number; status?: string; search?: string; dateStart?: string; dateEnd?: string }): Promise<SantriEwalletDashboardResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriEwalletDashboardResponse>>("/santri/ewallet", { params })
		return {
			...res.data,
			meta: res.meta || (res.data as any)?.meta,
		}
	},
	validateCurrentPin: async (pin: string): Promise<{ message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ message: string }>>("/santri/ewallet/pin/validate-current", { pin })
		return res.data
	},
	updatePin: async (data: SantriUpdatePinDto): Promise<{ message: string }> => {
		const { data: res } = await client.patch<ApiResponse<{ message: string }>>("/santri/ewallet/pin", data)
		return res.data
	},
	sendPinResetEmail: async (): Promise<{ message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ message: string }>>("/santri/ewallet/pin/reset-email")
		return res.data
	},
	validatePinResetToken: async (token: string): Promise<{ message: string }> => {
		const { data: res } = await client.get<ApiResponse<{ message: string }>>(`/santri/ewallet/pin/reset/${token}`)
		return res.data
	},
	resetPin: async (data: SantriResetPinDto): Promise<{ message: string }> => {
		const { data: res } = await client.patch<ApiResponse<{ message: string }>>("/santri/ewallet/pin/reset", data)
		return res.data
	},
	getTransactions: async (params?: Record<string, any>): Promise<EwalletTransaction[]> => {
		const { data: res } = await client.get<ApiResponse<EwalletTransaction[]>>("/santri/ewallet/transactions", { params })
		return res.data
	},
	getTransactionDetail: async (id: number): Promise<SantriTransactionDetailResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriTransactionDetailResponse>>(`/santri/ewallet/transactions/${id}`)
		return res.data
	},
	getTopUpBankInfo: async (): Promise<any> => {
		const { data: res } = await client.get<ApiResponse<any>>("/santri/ewallet/top-up/bank-transfer")
		return res.data
	},
	storeTopUpBankTransfer: async (data: SantriTopUpBankTransferDto): Promise<{
		transactionId: number
		code: string
		amount: number
		transferNewsNumber: number
		totalAmount: number
		paymentAccount: string
		paymentOnBehalfOf: string
		message: string
	}> => {
		const { data: res } = await client.post<ApiResponse<any>>("/santri/ewallet/top-up/bank-transfer", data)
		return res.data
	},
	getConfirmForm: async (id: number): Promise<SantriTransactionDetailResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriTransactionDetailResponse>>(`/santri/ewallet/top-up/confirm/${id}`)
		return res.data
	},
	confirmTopUp: async (id: number, formData: FormData): Promise<{ message: string }> => {
		const { data: res } = await client.patch<ApiResponse<{ message: string }>>(`/santri/ewallet/top-up/confirm/${id}`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		})
		return res.data
	},
	getPaymentSummary: async (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<SantriPaymentSummaryResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriPaymentSummaryResponse>>("/santri/payment-history", { params })
		return {
			...res.data,
			meta: res.meta || (res.data as any)?.meta,
		}
	},
	getInvoiceList: async (studentId: number, params?: { page?: number; limit?: number }): Promise<StudentInvoice[]> => {
		const { data: res } = await client.get<ApiResponse<StudentInvoice[]>>(`/santri/payment-history/${studentId}/list`, { params })
		return res.data
	},
	getInvoiceDetail: async (invoiceId: number, params?: { page?: number; limit?: number }): Promise<SantriInvoiceDetailResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriInvoiceDetailResponse>>(`/santri/payment-history/invoice/${invoiceId}`, { params })
		return {
			...res.data,
			meta: res.meta || (res.data as any)?.meta,
		}
	},
	getSettingPage: async (): Promise<SantriSettingPageResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriSettingPageResponse>>("/santri/setting")
		return res.data
	},
	changePassword: async (data: SantriChangePasswordDto): Promise<{ message: string }> => {
		const { data: res } = await client.patch<ApiResponse<{ message: string }>>("/santri/setting/password", data)
		return res.data
	},
	toggle2fa: async (data: SantriToggle2faDto): Promise<{ message: string }> => {
		const { data: res } = await client.patch<ApiResponse<{ message: string }>>("/santri/setting/2fa", data)
		return res.data
	},
	resendSettingEmailVerification: async (): Promise<{ message: string }> => {
		const { data: res } = await client.get<ApiResponse<{ message: string }>>("/santri/setting/email/resend")
		return res.data
	},
})
