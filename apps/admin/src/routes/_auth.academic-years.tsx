import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

// Tahun Ajaran — sidebar gate is `@canany(do-as-superadmin, do-as-admin)`
export const Route = createFileRoute("/_auth/academic-years")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: AcademicYearsLayout,
})

function AcademicYearsLayout(): JSX.Element {
	return <Outlet />
}

export default AcademicYearsLayout
