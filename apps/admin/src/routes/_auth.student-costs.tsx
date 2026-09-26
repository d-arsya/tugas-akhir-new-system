import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/student-costs")({
	beforeLoad: () => requireRoles("superadmin", "bendahara"),
	component: StudentCostsLayout,
})

function StudentCostsLayout(): JSX.Element {
	return <Outlet />
}

export default StudentCostsLayout
