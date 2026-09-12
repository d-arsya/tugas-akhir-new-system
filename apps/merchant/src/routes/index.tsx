import type { JSX } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import useAuthStore from "@/stores/authStore"

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		const auth = useAuthStore.getState()
		if (auth.isAuthenticated) {
			throw redirect({ to: "/e-wallet" })
		}
		throw redirect({ to: "/login" })
	},
	component: (): JSX.Element => <div />,
})

export default Route
