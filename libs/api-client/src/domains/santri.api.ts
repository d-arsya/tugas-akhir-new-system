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
	remember?: boolean
}

export type SantriLoginResponse = {
	requires2fa?: boolean
	email?: string
	tokens?: {
		accessToken: string
		refreshToken: string
	}
	user?: AuthUser
}

export type SantriApi = {
	login: (data: SantriLoginDto) => Promise<SantriLoginResponse>
	verify2fa: (code: string) => Promise<{ tokens: { accessToken: string; refreshToken: string }; user: AuthUser }>
	logout: () => Promise<void>
	getProfile: () => Promise<Student>
	getEwallet: () => Promise<Ewallet>
	getTransactions: () => Promise<EwalletTransaction[]>
	getInvoices: () => Promise<StudentInvoice[]>
}

export const createSantriApi = (client: AxiosInstance): SantriApi => ({
	login: async (data): Promise<SantriLoginResponse> => {
		const { data: res } = await client.post<ApiResponse<SantriLoginResponse>>("/santri/auth/login", data)
		return res.data
	},
	verify2fa: async (code): Promise<{ tokens: { accessToken: string; refreshToken: string }; user: AuthUser }> => {
		const { data: res } = await client.post<ApiResponse<{ tokens: { accessToken: string; refreshToken: string }; user: AuthUser }>>("/santri/auth/verify-2fa", { code })
		return res.data
	},
	logout: async (): Promise<void> => {
		await client.post("/santri/auth/logout")
	},
	getProfile: async (): Promise<Student> => {
		const { data: res } = await client.get<ApiResponse<Student>>("/santri/profile")
		return res.data
	},
	getEwallet: async (): Promise<Ewallet> => {
		const { data: res } = await client.get<ApiResponse<Ewallet>>("/santri/ewallet")
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
})

