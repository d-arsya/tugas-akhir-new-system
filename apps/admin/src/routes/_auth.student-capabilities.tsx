import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

// Kesanggupan — same `asBendahara` gate as the rest of Pembayaran Santri.
// Pages land in phase 2; this layout and its index exist so the sidebar link resolves.
export const Route = createFileRoute("/_auth/student-capabilities")({
	beforeLoad: () => requireRoles("superadmin", "bendahara"),
	component: StudentCapabilitiesLayout,
})

function StudentCapabilitiesLayout(): JSX.Element {
	return <Outlet />
}

export default StudentCapabilitiesLayout
