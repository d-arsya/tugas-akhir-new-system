import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser } from "@roja/types"

type AuthState = {
	user: AuthUser | null
	isAuthenticated: boolean
}

type AuthActions = {
	login: (userOrToken: AuthUser | string, refreshToken?: string, userObj?: AuthUser) => void
	logout: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,

			login: (userOrToken, _refreshToken, userObj) => {
				const user: AuthUser = typeof userOrToken === "object" && userOrToken !== null ? userOrToken : userObj!
				const adminUser = user ? { ...user, domain: "admin" } : null
				set({ user: adminUser, isAuthenticated: true })
			},

			logout: () => {
				set({ user: null, isAuthenticated: false })
			},
		}),
		{
			name: "roja-auth",
			partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
		},
	),
)

export default useAuthStore

