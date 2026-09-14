import type { JSX } from "react"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import { AdminShell } from "@/components/layout/admin-shell"

export const Route = createFileRoute("/_auth")({
	beforeLoad: () => {
		const auth = useAuthStore.getState()
		if (!auth.isAuthenticated) {
			throw redirect({ to: "/login" as any })
		}
	},
	component: AuthLayout,
})

function AuthLayout(): JSX.Element {
	const auth = useAuthStore()
	const userRole = auth.user?.role || "SUPERADMIN"

	return (
		<AdminShell
			user={auth.user}
			userRole={userRole}
			onLogout={() => auth.logout()}
		>
			<Outlet />
		</AdminShell>
	)
}

export default AuthLayout
