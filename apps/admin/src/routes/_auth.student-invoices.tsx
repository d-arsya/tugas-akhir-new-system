import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

// Pembayaran Santri — legacy gates the whole menu with `asBendahara`, and the sidebar
// block is `@canany(do-as-superadmin, do-as-bendahara)`. Narrower than Data Master:
// admin and kasir reach the cost-term master data but must NOT reach Tagihan.
export const Route = createFileRoute("/_auth/student-invoices")({
	beforeLoad: () => requireRoles("superadmin", "bendahara"),
	component: StudentInvoicesLayout,
})

function StudentInvoicesLayout(): JSX.Element {
	return <Outlet />
}

export default StudentInvoicesLayout
