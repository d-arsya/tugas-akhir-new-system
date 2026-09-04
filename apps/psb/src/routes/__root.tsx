import type { JSX } from "react"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Toaster } from "sonner"
import DevHijackPanel from "@/components/dev-hijack-panel"

export const Route = createRootRoute({
	component: (): JSX.Element => (
		<>
			<Outlet />
			<Toaster position="top-right" richColors closeButton />
			<DevHijackPanel />
			{import.meta.env.DEV && <TanStackRouterDevtools />}
		</>
	),
})

