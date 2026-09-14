import { type JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/alumni")({
	component: AlumniLayoutPage,
})

function AlumniLayoutPage(): JSX.Element {
	return <Outlet />
}
