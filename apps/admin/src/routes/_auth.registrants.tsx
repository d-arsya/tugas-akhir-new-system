import { type JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/registrants")({
	component: RegistrantsLayoutPage,
})

function RegistrantsLayoutPage(): JSX.Element {
	return <Outlet />
}
