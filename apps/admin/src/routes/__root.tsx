import type { JSX } from "react"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Toaster } from "sonner"

export const Route = createRootRoute({
	component: (): JSX.Element => (
		<>
			<Outlet />
			<Toaster position="top-right" richColors closeButton />
			{import.meta.env.DEV && <TanStackRouterDevtools />}
		</>
	),
})
