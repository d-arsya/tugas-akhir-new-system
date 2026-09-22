import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/reports")({
	component: ReportsLayout,
})

function ReportsLayout(): JSX.Element {
	return <Outlet />
}

export default ReportsLayout
