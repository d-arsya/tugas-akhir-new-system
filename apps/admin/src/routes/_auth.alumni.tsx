import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/alumni")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: Layout,
})

function Layout(): JSX.Element {
	return <Outlet />
}

export default Layout
