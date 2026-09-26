import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import MajorsPage from "@/components/majors/majors-page"
import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/majors")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: MajorsRoute,
})

function MajorsRoute(): JSX.Element {
	return <MajorsPage />
}

export default MajorsRoute
