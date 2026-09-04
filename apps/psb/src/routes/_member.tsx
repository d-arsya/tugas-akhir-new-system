import type { JSX } from "react"
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import Header from "@/components/header"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"

export const Route = createFileRoute("/_member")({
	beforeLoad: () => {
		if (IS_DEV_HIJACK) return
		const auth = useAuthStore.getState()
		if (!auth.isAuthenticated) {
			throw redirect({ to: "/login" })
		}
	},

	component: (): JSX.Element => {
		return (
			<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
				{/* Unified Dynamic Header */}
				<Header />

				{/* Background decorative blob shapes */}
				<div className="roja_bg_blobs" />

				{/* Main Content Card Container */}
				<main className="flex-1 relative z-10 px-4 pb-12 pt-[25px] w-full max-w-6xl mx-auto flex items-center justify-center">
					<div className="roja_card_wizard w-full relative overflow-hidden p-8 md:p-12">
						{/* Corner gradient glows inside card */}
						<div className="absolute -top-12 -left-12 w-48 h-48 bg-[var(--primary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />
						<div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--secondary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />

						<div className="relative z-10 w-full">
							<Outlet />
						</div>
					</div>
				</main>

				{/* Footer bar */}
				<footer className="w-full bg-white border-t border-[var(--bg-form-border)] py-4 px-8 text-center md:flex md:justify-between text-[10px] text-[#abb4be] font-medium mt-auto relative z-10">
					<span>© Copyright 2026 TMQ (TARBIYYATU MUHAFFIZHATIL QUR'AN) PONDOK ROJA. All Rights Reserved.</span>
					<span className="mt-1 md:mt-0 block">Version 1.1.2</span>
				</footer>
			</div>
		)
	},
})
