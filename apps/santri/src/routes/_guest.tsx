import type { JSX } from "react"
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"

export const Route = createFileRoute("/_guest")({
	beforeLoad: () => {
		if (IS_DEV_HIJACK) return
		const auth = useAuthStore.getState()
		if (auth.isAuthenticated) {
			throw redirect({ to: "/dashboard" })
		}
	},

	component: (): JSX.Element => {
		return (
			<div className="min-h-screen bg-[var(--bg-login)] text-[var(--body-txt-inverse)] flex items-center justify-center p-4 font-sans antialiased transition-colors duration-300">
				<div className="w-full max-w-md">
					<Outlet />
				</div>
			</div>
		)
	},
})

export default Route
