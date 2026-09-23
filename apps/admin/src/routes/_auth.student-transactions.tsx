import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

// Riwayat Transaksi — same `asBendahara` gate as Tagihan.
export const Route = createFileRoute("/_auth/student-transactions")({
	beforeLoad: () => requireRoles("superadmin", "bendahara"),
	component: StudentTransactionsLayout,
})

function StudentTransactionsLayout(): JSX.Element {
	return <Outlet />
}

export default StudentTransactionsLayout
