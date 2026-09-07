import type { JSX } from "react"
import { createFileRoute, redirect, Outlet, useLocation } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import PageLayout from "@/components/page-layout"
import Sidebar from "@/components/layout/Sidebar"
import PageTitle from "@/components/layout/PageTitle"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"

const getTitleFromPath = (pathname: string): string => {
	if (pathname.includes("payment-history")) return "Pembayaran Santri"
	if (pathname.includes("profile")) return "Profil Saya"
	if (pathname.includes("setting")) return "Pengaturan"
	if (pathname.includes("e-wallet")) return "Dompet Digital"
	return "Dashboard Santri"
}

const getBreadcrumbsFromPath = (pathname: string): Array<{ label: string; to?: string }> => {
	if (pathname.includes("/payment-history/detail")) {
		return [
			{ label: "Pembayaran Santri", to: "/payment-history" },
			{ label: "Detail" },
		]
	}
	if (pathname.includes("/payment-history")) {
		return [{ label: "Pembayaran Santri" }]
	}
	if (pathname.includes("/e-wallet/withdraw")) {
		return [
			{ label: "Dompet Digital", to: "/e-wallet" },
			{ label: "Tarik Saldo" },
		]
	}
	if (pathname.includes("/e-wallet/top-up/cash")) {
		return [
			{ label: "Dompet Digital", to: "/e-wallet" },
			{ label: "Isi Saldo Cash" },
		]
	}
	if (pathname.includes("/e-wallet/top-up/bank-transfer")) {
		return [
			{ label: "Dompet Digital", to: "/e-wallet" },
			{ label: "Konfirmasi Transfer" },
		]
	}
	if (pathname.includes("/e-wallet/edit-pin")) {
		return [
			{ label: "Dompet Digital", to: "/e-wallet" },
			{ label: "Pengaturan PIN" },
		]
	}
	if (pathname.includes("/e-wallet/transactions")) {
		return [
			{ label: "Dompet Digital", to: "/e-wallet" },
			{ label: "Detail Transaksi" },
		]
	}
	if (pathname.includes("/e-wallet")) {
		return [{ label: "Dompet Digital" }]
	}
	if (pathname.includes("/profile")) {
		return [{ label: "Profil Saya" }]
	}
	if (pathname.includes("/setting")) {
		return [{ label: "Pengaturan" }]
	}
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
				showFooter={true}
				topBanner={<PageTitle title={title} breadcrumbs={breadcrumbs} />}
			>
				{/* 2-Column Responsive Workspace Grid with left & right white space */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full">
					{/* Left Column: Compact Floating Card Sidebar */}
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
