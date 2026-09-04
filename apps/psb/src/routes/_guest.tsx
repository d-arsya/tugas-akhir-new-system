import type { JSX } from "react"
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import Header from "@/components/header"
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
			<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
				<Header />
				<div className="roja_bg_blobs" />
				<main className="flex-1 relative z-10 px-4 py-8 max-w-6xl mx-auto w-full">
					<Outlet />
				</main>
			</div>
		)
	},
})
