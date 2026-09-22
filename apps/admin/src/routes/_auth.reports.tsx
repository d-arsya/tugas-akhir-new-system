import type { JSX } from "react"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { normalizeRole } from "@/lib/admin-roles"
import useAuthStore from "@/stores/auth.store"

// Legacy `report` routes sit behind the `asBendahara` middleware (Superadmin & Bendahara only)
export const Route = createFileRoute("/_auth/reports")({
	beforeLoad: () => {
		const role = normalizeRole(useAuthStore.getState().user?.role)
		if (role === "kasir") throw redirect({ to: "/ewallets" })
		if (role !== "superadmin" && role !== "bendahara") throw redirect({ to: "/dashboard" })
	},
	component: ReportsLayout,
})

function ReportsLayout(): JSX.Element {
	return <Outlet />
}

export default ReportsLayout
