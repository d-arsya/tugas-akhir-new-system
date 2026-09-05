import type { JSX } from "react"
import { createFileRoute, redirect, Outlet, useLocation } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import Header from "@/components/layout/Header"
import PageTitle from "@/components/layout/PageTitle"
import Sidebar from "@/components/layout/Sidebar"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
	"/dashboard": { title: "Dashboard Santri", breadcrumb: "Dashboard" },
	"/payment-history": { title: "Pembayaran Santri", breadcrumb: "Pembayaran Santri" },
	"/profile": { title: "Profil Saya", breadcrumb: "Profil Saya" },
	"/setting": { title: "Pengaturan Akun", breadcrumb: "Pengaturan" },
	"/e-wallet": { title: "Dompet Digital", breadcrumb: "Dompet Digital" },
}

export const Route = createFileRoute("/_member")({
	beforeLoad: () => {
		if (IS_DEV_HIJACK) return
		const auth = useAuthStore.getState()
		if (!auth.isAuthenticated) {
			throw redirect({ to: "/login" })
		}
	},

	component: (): JSX.Element => {
		const location = useLocation()
		const routeMeta = pageTitles[location.pathname] || {
			title: "Portal Santri",
			breadcrumb: "Santri",
		}

		return (
			<div className="min-h-screen bg-[#F7F9FB] dark:bg-[#111e2c] text-[var(--body-txt-inverse)] flex flex-col font-sans antialiased transition-colors duration-300">
				{/* Top Header */}
				<Header />

				{/* Page Title Banner */}
				<PageTitle
					title={routeMeta.title}
					breadcrumbs={[{ label: routeMeta.breadcrumb }]}
				/>

				{/* Container 2-Column Main Workspace */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
						{/* Left Column: Stacked Card Sidebar */}
						<div className="md:col-span-4 lg:col-span-3">
							<Sidebar />
						</div>

						{/* Right Column: Main Content Workspace */}
						<div className="md:col-span-8 lg:col-span-9 min-w-0">
							<Outlet />
						</div>
					</div>
				</div>
			</div>
		)
	},
})

export default Route
