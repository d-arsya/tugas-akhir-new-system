import type { JSX } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		if (IS_DEV_HIJACK) {
			const auth = useAuthStore.getState()
			if (auth.isAuthenticated) {
				throw redirect({ to: "/dashboard" })
			} else {
				throw redirect({ to: "/login" })
			}
		}
		const auth = useAuthStore.getState()
		if (auth.isAuthenticated) {
			throw redirect({ to: "/dashboard" })
		} else {
			throw redirect({ to: "/login" })
		}
	},
	component: (): JSX.Element | null => null,
})

export default Route
