import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/users")({
	beforeLoad: () => requireRoles("superadmin"),
	component: UsersLayout,
})

function UsersLayout(): JSX.Element {
	return <Outlet />
}

export default UsersLayout
