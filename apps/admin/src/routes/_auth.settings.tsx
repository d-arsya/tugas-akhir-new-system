import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

// Each Pengaturan page carries its own role guard, so the layout only renders the child route
export const Route = createFileRoute("/_auth/settings")({
	component: SettingsLayout,
})

function SettingsLayout(): JSX.Element {
	return <Outlet />
}

export default SettingsLayout
