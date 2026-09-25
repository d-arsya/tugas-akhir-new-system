import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

// Dompet — legacy `can:do-as-cashier` (Superadmin + Kasir E-Wallet). The pages land in the Dompet phase; these stubs exist so the sidebar links resolve.
export const Route = createFileRoute("/_auth/ewallets")({
	beforeLoad: () => requireRoles("superadmin", "kasir"),
	component: Layout,
})

function Layout(): JSX.Element {
	return <Outlet />
}

export default Layout
