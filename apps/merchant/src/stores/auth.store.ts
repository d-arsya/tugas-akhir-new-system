import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser } from "@roja/types"

type AuthState = {
	user: AuthUser | null
	accessToken: string | null
	isAuthenticated: boolean
}

type AuthActions = {
	login: (arg1: AuthUser | string, arg2?: string, arg3?: AuthUser) => void
	logout: () => void
	setAccessToken: (token: string) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			isAuthenticated: false,

			login: (arg1, arg2, arg3) => {
				let user: AuthUser | null = null
				let accessToken: string | null = null

				if (typeof arg1 === "string") {
					accessToken = arg1
					if (arg2) {
						localStorage.setItem("roja-refresh-token", arg2)
					}
					user = arg3 ?? null
				} else if (arg1 && typeof arg1 === "object") {
					user = arg1 as AuthUser
				}

				if (user && !user.domain) {
					user.domain = "merchant"
				}

				set({ user, accessToken, isAuthenticated: true })
			},

			logout: () => {
				localStorage.removeItem("roja-refresh-token")
				set({ user: null, accessToken: null, isAuthenticated: false })
			},

			setAccessToken: (accessToken) => set({ accessToken }),
		}),
		{
			name: "roja-merchant-auth",
			partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
		},
	),
)

export default useAuthStore

