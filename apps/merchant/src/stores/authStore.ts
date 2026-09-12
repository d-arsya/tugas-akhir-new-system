import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser } from "@roja/types"

type AuthState = {
	user: AuthUser | null
	isAuthenticated: boolean
}

type AuthActions = {
	login: (user: AuthUser) => void
	logout: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,

			login: (user) => {
				set({ user, isAuthenticated: true })
			},

			logout: () => {
				set({ user: null, isAuthenticated: false })
			},
		}),
		{
			name: "roja-merchant-auth",
			partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
		},
	),
)

export default useAuthStore
