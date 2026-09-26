import type { JSX } from "react"
import { createFileRoute, isRedirect, redirect, Outlet } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import { PageLayout, RojaHeader } from "@roja/ui"
import { apiClient } from "@/lib/api"

export const Route = createFileRoute("/_guest")({
	beforeLoad: async () => {
		const auth = useAuthStore.getState()
		if (auth.isAuthenticated) {
			throw redirect({ to: "/dashboard" })
		}
		try {
			const res = await apiClient.post("/admin/auth/refresh")
			const authData = res.data?.data || res.data
			if (authData?.user) {
				auth.login(authData.user, undefined, authData.user)
				throw redirect({ to: "/dashboard" })
			}
		} catch (err) {
			if (isRedirect(err)) throw err
		}
	},

	component: (): JSX.Element => {
		return (
			<PageLayout
				header={<RojaHeader roleLabel="ADMIN" isAuthenticated={false} />}
				maxWidth="max-w-6xl"
				variant="center"
			>
				<Outlet />
			</PageLayout>
		)
	},
})
