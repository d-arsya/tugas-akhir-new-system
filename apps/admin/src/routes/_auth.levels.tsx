import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/levels")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: LevelsLayout,
})

function LevelsLayout(): JSX.Element {
	return <Outlet />
}

export default LevelsLayout
