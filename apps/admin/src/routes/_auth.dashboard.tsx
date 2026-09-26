import type { JSX } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"

import DashboardPage, { type DashboardSearch } from "@/components/dashboard/dashboard-page"
import { normalizeRole } from "@/lib/admin-roles"
import useAuthStore from "@/stores/auth.store"

const toPositiveInt = (value: unknown): number | undefined => {
	const parsed = Number(value)
	return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export const Route = createFileRoute("/_auth/dashboard")({
	validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
		summary_academic_year: toPositiveInt(search["summary_academic_year"]),
		grade: toPositiveInt(search["grade"]),
	}),
	beforeLoad: () => {
		if (normalizeRole(useAuthStore.getState().user?.role) === "kasir") {
			throw redirect({ to: "/ewallets" })
		}
	},
	component: DashboardRoute,
})

function DashboardRoute(): JSX.Element {
	return <DashboardPage search={Route.useSearch()} />
}

export default DashboardRoute
