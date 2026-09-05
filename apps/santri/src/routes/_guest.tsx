import type { JSX } from "react"
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import PageLayout from "@/components/page-layout"
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
			<PageLayout maxWidth="max-w-6xl">
				<Outlet />
			</PageLayout>
		)
	},
})

export default Route
