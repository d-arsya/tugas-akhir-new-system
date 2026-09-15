import type { JSX } from "react"
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import { AdminShell } from "@/components/layout/admin-shell"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"
import { adminApi } from "@/lib/api"

export const Route = createFileRoute("/_auth")({
	beforeLoad: () => {
		if (IS_DEV_HIJACK) return
		const auth = useAuthStore.getState()
		if (!auth.isAuthenticated) {
			throw redirect({ to: "/login" as any })
		}
	},
	component: AuthLayout,
})

function AuthLayout(): JSX.Element {
	const auth = useAuthStore()
	const navigate = useNavigate()
	const userRole = auth.user?.role || "SUPERADMIN"

	const handleLogout = async (): Promise<void> => {
		try {
			await adminApi.logout()
		} catch {
			// ignore
		}
		auth.logout()
		navigate({ to: "/login" as any })
	}

	return (
		<AdminShell
			user={auth.user}
			userRole={userRole}
			onLogout={handleLogout}
		>
			<Outlet />
		</AdminShell>
	)
}

export default AuthLayout
