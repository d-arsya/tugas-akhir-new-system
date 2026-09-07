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
	setAuth: (user: AuthUser, accessToken: string) => void
	logout: () => void
	setAccessToken: (token: string) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			isAuthenticated: false,

			login: (accessToken, refreshToken, user) => {
				localStorage.setItem("roja-refresh-token", refreshToken)
				set({ accessToken, user, isAuthenticated: true })
			},

			setAuth: (user, accessToken) => {
				set({ user, accessToken, isAuthenticated: true })
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
