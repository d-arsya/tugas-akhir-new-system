import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/student-invoices")({
	beforeLoad: () => requireRoles("superadmin", "bendahara"),
	component: StudentInvoicesLayout,
})

function StudentInvoicesLayout(): JSX.Element {
	return <Outlet />
}

export default StudentInvoicesLayout
