import type { JSX } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		const auth = useAuthStore.getState()
		if (auth.isAuthenticated) {
			throw redirect({ to: "/dashboard" as any })
		}
		throw redirect({ to: "/login" as any })
	},
	component: () => null as unknown as JSX.Element,
})

export default Route
