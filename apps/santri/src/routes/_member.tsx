import type { JSX } from "react"
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import PageLayout from "@/components/page-layout"
import Sidebar from "@/components/layout/Sidebar"
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
			<PageLayout maxWidth="max-w-7xl" showFooter={true}>
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
					{/* Left Column: Stacked Card Sidebar */}
					<div className="md:col-span-4 lg:col-span-3">
						<Sidebar />
					</div>

					{/* Right Column: Main Content Workspace */}
					<div className="md:col-span-8 lg:col-span-9 min-w-0">
						<Outlet />
					</div>
				</div>
			</PageLayout>
		)
	},
})

export default Route
