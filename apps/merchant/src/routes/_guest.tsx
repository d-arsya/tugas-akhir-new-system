import type { JSX } from "react"
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import useAuthStore from "@/stores/authStore"
import { PageLayout, RojaHeader } from "@roja/ui"

export const Route = createFileRoute("/_guest")({
	beforeLoad: () => {
		const auth = useAuthStore.getState()
		if (auth.isAuthenticated) {
			throw redirect({ to: "/e-wallet" })
		}
	},

	component: (): JSX.Element => {
		return (
			<PageLayout
				header={<RojaHeader roleLabel="MERCHANT" isAuthenticated={false} />}
				maxWidth="max-w-6xl"
				variant="center"
			>
				<Outlet />
			</PageLayout>
		)
	},
})

export default Route
