import type { JSX } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"

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
