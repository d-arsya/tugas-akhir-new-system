import type { JSX } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		const auth = useAuthStore.getState()
		if (auth.isAuthenticated) {
			throw redirect({ to: "/payment-history" })
		} else {
			throw redirect({ to: "/login" })
		}
	},
	component: (): JSX.Element | null => null,
})

export default Route
