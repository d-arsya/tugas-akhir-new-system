import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/settings")({
	component: SettingsLayout,
})

function SettingsLayout(): JSX.Element {
	return <Outlet />
}

export default SettingsLayout
