import { type JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/student-capabilities")({
	component: StudentCapabilitiesLayoutPage,
})

function StudentCapabilitiesLayoutPage(): JSX.Element {
	return <Outlet />
}
