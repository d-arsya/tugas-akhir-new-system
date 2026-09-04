import type { JSX } from "react"
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import Header from "@/components/header"
import useAuthStore from "@/stores/auth.store"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"

export const Route = createFileRoute("/_wizard")({
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
				
				{/* Background decorative blob shapes */}
				<div className="roja_bg_blobs" />

				<main className="flex-1 relative z-10 px-4 py-8 w-full max-w-5xl mx-auto flex items-center justify-center">
					<div className="roja_card_wizard w-full relative overflow-hidden p-8 md:p-12">
						{/* Corner gradient glows inside card */}
						<div className="absolute -top-12 -left-12 w-48 h-48 bg-[var(--primary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />
						<div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--secondary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />

						<div className="relative z-10">
							<Outlet />
						</div>
					</div>
				</main>
			</div>
		)
	},
})
