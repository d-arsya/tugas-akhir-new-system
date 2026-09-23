import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

// Merchant — sidebar gate is `@canany(do-as-superadmin, do-as-admin, do-as-cashier)`
export const Route = createFileRoute("/_auth/merchants")({
	beforeLoad: () => requireRoles("superadmin", "admin", "kasir"),
	component: MerchantsLayout,
})

function MerchantsLayout(): JSX.Element {
	return <Outlet />
}

export default MerchantsLayout
