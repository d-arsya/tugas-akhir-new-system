import { createFileRoute, redirect } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import AdminAuthLayout from "@/components/layout/admin-auth-layout"
import { apiClient } from "@/lib/api"

export const Route = createFileRoute("/_auth")({
	beforeLoad: async () => {
		const auth = useAuthStore.getState()
		if (!auth.isAuthenticated) {
			try {
				const res = await apiClient.post("/admin/auth/refresh")
				const authData = res.data?.data || res.data
				if (authData?.user) {
					auth.login(authData.user, undefined, authData.user)
					return
				}
			} catch {
				// Refresh token missing or expired, proceed to login redirect
			}
			throw redirect({ to: "/login" })
		}
	},
	component: AdminAuthLayout,
})
