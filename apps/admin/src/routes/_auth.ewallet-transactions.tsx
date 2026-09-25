import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

// Riwayat Transaksi — same `can:do-as-cashier` gate as Akun Dompet.
export const Route = createFileRoute("/_auth/ewallet-transactions")({
	beforeLoad: () => requireRoles("superadmin", "kasir"),
	component: Layout,
})

function Layout(): JSX.Element {
	return <Outlet />
}

export default Layout
