import type { JSX } from "react"
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import AdminShell from "@/components/layout/admin-shell"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"
import { adminApi, apiClient } from "@/lib/api"
import { normalizeRole } from "@/lib/admin-roles"

export const Route = createFileRoute("/_auth")({
	beforeLoad: async () => {
		if (IS_DEV_HIJACK) return
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
	component: AuthLayout,
})

function AuthLayout(): JSX.Element {
	const auth = useAuthStore()
	const navigate = useNavigate()

	const handleLogout = async (): Promise<void> => {
		try {
			await adminApi.logout()
		} catch {
			// ignore
		}
		auth.logout()
		navigate({ to: "/login" })
	}

	return (
		<AdminShell
			userName={auth.user?.name ?? ""}
			role={normalizeRole(auth.user?.role)}
			onLogout={handleLogout}
		>
			<Outlet />
		</AdminShell>
	)
}

export default AuthLayout
