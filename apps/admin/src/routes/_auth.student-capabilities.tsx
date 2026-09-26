import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/student-capabilities")({
	beforeLoad: () => requireRoles("superadmin", "bendahara"),
	component: StudentCapabilitiesLayout,
})

function StudentCapabilitiesLayout(): JSX.Element {
	return <Outlet />
}

export default StudentCapabilitiesLayout
