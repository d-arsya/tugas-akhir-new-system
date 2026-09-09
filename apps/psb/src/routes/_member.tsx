import type { JSX } from "react"
import { createFileRoute, redirect, Outlet, useLocation } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import PageLayout from "@/components/page-layout"
import { PageTitle } from "@roja/ui"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"

const getTitleFromPath = (pathname: string): string => {
	if (pathname.includes("dashboard")) return "Dashboard Pendaftar"
	if (pathname.includes("register")) return "Formulir Pendaftaran"
	if (pathname.includes("settings")) return "Pengaturan Akun"
	if (pathname.includes("invalid")) return "Perbaikan Data"
	return "Member Area"
}

const getBreadcrumbsFromPath = (pathname: string): Array<{ label: string; to?: string }> => {
	if (pathname.includes("settings")) return [{ label: "Pengaturan Akun" }]
	if (pathname.includes("invalid")) return [{ label: "Perbaikan Data" }]
	if (pathname.includes("register")) return [{ label: "Formulir Pendaftaran" }]
	return [{ label: "Dashboard" }]
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
		const title = getTitleFromPath(location.pathname)
		const breadcrumbs = getBreadcrumbsFromPath(location.pathname)

		return (
			<PageLayout
				maxWidth="max-w-6xl"
				showFooter
				topBanner={<PageTitle title={title} breadcrumbs={breadcrumbs} />}
			>
				<Outlet />
			</PageLayout>
		)
	},
})


