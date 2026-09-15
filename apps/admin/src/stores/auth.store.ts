import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser } from "@roja/types"

type AuthState = {
	user: AuthUser | null
	accessToken: string | null
	isAuthenticated: boolean
}

type AuthActions = {
	login: (accessToken: string, refreshToken: string, user: AuthUser) => void
	logout: () => void
	setAccessToken: (token: string) => void
}

const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			isAuthenticated: false,

			login: (accessToken, refreshToken, user) => {
				localStorage.setItem("roja-refresh-token", refreshToken)
				const adminUser = { ...user, domain: "admin" }
				set({ accessToken, user: adminUser, isAuthenticated: true })
			},

			logout: () => {
				localStorage.removeItem("roja-refresh-token")
				set({ user: null, accessToken: null, isAuthenticated: false })
			},

			setAccessToken: (accessToken) => set({ accessToken }),
		}),
		{
			name: "roja-auth",
			partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
		},
	),
)

export default useAuthStore
