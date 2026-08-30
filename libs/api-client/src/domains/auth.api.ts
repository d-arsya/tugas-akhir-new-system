import type { AxiosInstance } from "axios"
import type { ApiResponse, TokenPair } from "@roja/types"

type AuthApi = {
	refresh: (refreshToken: string) => Promise<TokenPair>
	logout: (refreshToken: string) => Promise<void>
}

export const createAuthApi = (client: AxiosInstance): AuthApi => ({
	refresh: async (refreshToken: string): Promise<TokenPair> => {
		const { data } = await client.post<ApiResponse<TokenPair>>("/auth/refresh", { refreshToken })
		return data.data
	},
	logout: async (refreshToken: string): Promise<void> => {
		await client.post("/auth/logout", { refreshToken })
	},
})
