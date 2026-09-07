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
			user: {
				id: number
				nis: string | null
				email: string | null
			}
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
	totalSaldo: number
	transactions: EwalletTransaction[]
}

export type SantriUpdatePinDto = {
	prevPin: string
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

export type SantriInvoiceDetailResponse = StudentInvoice & {
	note?: string
	studentName: string
	studentNis: string
	transactions: SantriInvoiceTransactionItem[]
	costRemain: number
}

export type SantriUpdateAccountSettingsDto = {
	email: string
	password?: string
	passwordConfirmation?: string
}

export type SantriUpdateTwoFactorDto = {
	enabled2fa: number // 1 or 0
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
	getProfile: () => Promise<Student & { gradeName?: string }>
	getEwallet: () => Promise<Ewallet>
	getEwalletStatus: () => Promise<SantriEwalletStatusResponse>
	loginEwalletPin: (pin: string) => Promise<{ success: boolean; message: string }>
	validatePrevPin: (pin: string) => Promise<{ success: boolean; message: string }>
	updatePin: (data: SantriUpdatePinDto) => Promise<{ success: boolean; message: string }>
	createEwallet: (data: SantriCreateEwalletDto) => Promise<{ success: boolean; message: string }>
	getEwalletDashboard: () => Promise<SantriEwalletDashboardResponse>
	getTransactionDetail: (id: number) => Promise<SantriTransactionDetailResponse>
	getTransactions: () => Promise<EwalletTransaction[]>
	getInvoices: () => Promise<StudentInvoice[]>
	getInvoiceDetail: (id: number) => Promise<SantriInvoiceDetailResponse>
	updateAccountSettings: (data: SantriUpdateAccountSettingsDto) => Promise<{ message: string }>
	updateTwoFactor: (data: SantriUpdateTwoFactorDto) => Promise<{ message: string }>
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
	getProfile: async (): Promise<Student> => {
		const { data: res } = await client.get<ApiResponse<Student>>("/santri/profile")
		return res.data
	},
	getEwallet: async (): Promise<Ewallet> => {
		const { data: res } = await client.get<ApiResponse<Ewallet>>("/santri/ewallet")
		return res.data
	},
	getEwalletStatus: async (): Promise<SantriEwalletStatusResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriEwalletStatusResponse>>("/santri/ewallet/status")
		return res.data
	},
	loginEwalletPin: async (pin: string): Promise<{ success: boolean; message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ success: boolean; message: string }>>("/santri/ewallet/login-pin", { pin })
		return res.data
	},
	validatePrevPin: async (pin: string): Promise<{ success: boolean; message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ success: boolean; message: string }>>("/santri/ewallet/validate-prev-pin", { pin })
		return res.data
	},
	updatePin: async (data: SantriUpdatePinDto): Promise<{ success: boolean; message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ success: boolean; message: string }>>("/santri/ewallet/update-pin", data)
		return res.data
	},
	createEwallet: async (data: SantriCreateEwalletDto): Promise<{ success: boolean; message: string }> => {
		const { data: res } = await client.post<ApiResponse<{ success: boolean; message: string }>>("/santri/ewallet/create", data)
		return res.data
	},
	getEwalletDashboard: async (): Promise<SantriEwalletDashboardResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriEwalletDashboardResponse>>("/santri/ewallet/dashboard")
		return res.data
	},
	getTransactionDetail: async (id: number): Promise<SantriTransactionDetailResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriTransactionDetailResponse>>(`/santri/ewallet/transactions/${id}`)
		return res.data
	},
	getTransactions: async (): Promise<EwalletTransaction[]> => {
		const { data: res } = await client.get<ApiResponse<EwalletTransaction[]>>("/santri/ewallet/transactions")
		return res.data
	},
	getInvoices: async (): Promise<StudentInvoice[]> => {
		const { data: res } = await client.get<ApiResponse<StudentInvoice[]>>("/santri/payment-history")
		return res.data
	},
	getInvoiceDetail: async (id: number): Promise<SantriInvoiceDetailResponse> => {
		const { data: res } = await client.get<ApiResponse<SantriInvoiceDetailResponse>>(`/santri/payment-history/${id}`)
		return res.data
	},
	updateAccountSettings: async (data: SantriUpdateAccountSettingsDto): Promise<{ message: string }> => {
		const { data: res } = await client.patch<ApiResponse<{ message: string }>>("/santri/setting/update", data)
		return res.data
	},
	updateTwoFactor: async (data: SantriUpdateTwoFactorDto): Promise<{ message: string }> => {
		const { data: res } = await client.patch<ApiResponse<{ message: string }>>("/santri/setting/update/twofactor", data)
		return res.data
	},
	resendSettingEmailVerification: async (): Promise<{ message: string }> => {
		const { data: res } = await client.get<ApiResponse<{ message: string }>>("/santri/setting/email/verify/resend")
		return res.data
	},
})
