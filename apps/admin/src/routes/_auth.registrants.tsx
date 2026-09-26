import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

// Akademik → PSB — legacy `asAdmin` middleware: Superadmin + Admin only.
export const Route = createFileRoute("/_auth/registrants")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: Layout,
})

function Layout(): JSX.Element {
	return <Outlet />
}

export default Layout
