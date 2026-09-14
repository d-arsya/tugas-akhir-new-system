import { type JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/students")({
	component: StudentsLayoutPage,
})

function StudentsLayoutPage(): JSX.Element {
	return <Outlet />
}
