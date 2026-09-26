import type { JSX } from "react"
import { Outlet } from "@tanstack/react-router"

import { useAdminLogout } from "@/hooks/use-admin-queries"
import { normalizeRole } from "@/lib/admin-roles"
import useAuthStore from "@/stores/auth.store"

import AdminShell from "./admin-shell"

const AdminAuthLayout = (): JSX.Element => {
	const auth = useAuthStore()
	const handleLogout = useAdminLogout()

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

export default AdminAuthLayout
