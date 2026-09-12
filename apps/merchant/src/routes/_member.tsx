import type { JSX } from "react"
import { createFileRoute, redirect, Outlet, useLocation, useNavigate } from "@tanstack/react-router"
import useAuthStore from "@/stores/authStore"
import { PageTitle, PageLayout, RojaHeader } from "@roja/ui"
import Sidebar from "@/components/layout/Sidebar"
import { IS_DEV_HIJACK } from "@/lib/dev-hijack"

const getTitleFromPath = (pathname: string): string => {
	if (pathname.includes("/transactions/") && pathname.includes("/detail")) return "Detail Transaksi"
	if (pathname.includes("/transactions/") && pathname.includes("/scan-qr")) return "Scan QR Code"
	if (pathname.includes("/transactions/") && pathname.includes("/checkout")) return "Konfirmasi Checkout"
	if (pathname.includes("/e-wallet/withdraw")) return "Tarik Saldo"
	if (pathname.includes("/e-wallet/top-up")) return "Isi Saldo"
	if (pathname.includes("/e-wallet/edit-pin")) return "Pengaturan PIN"
	if (pathname.includes("/e-wallet")) return "Dompet Digital"
	if (pathname.includes("/profile")) return "Profil Merchant"
	if (pathname.includes("/setting")) return "Pengaturan"
	return "Dompet Digital"
}

const getBreadcrumbsFromPath = (pathname: string): Array<{ label: string; to?: string }> => {
	if (pathname.includes("/transactions/") && pathname.includes("/detail")) {
		return [{ label: "Dompet Digital", to: "/e-wallet" }, { label: "Detail Transaksi" }]
	}
	if (pathname.includes("/transactions/") && pathname.includes("/scan-qr")) {
		return [{ label: "Dompet Digital", to: "/e-wallet" }, { label: "Scan QR Code" }]
	}
	if (pathname.includes("/transactions/") && pathname.includes("/checkout")) {
		return [{ label: "Dompet Digital", to: "/e-wallet" }, { label: "Konfirmasi Checkout" }]
	}
	if (pathname.includes("/e-wallet/withdraw")) {
		return [{ label: "Dompet Digital", to: "/e-wallet" }, { label: "Tarik Saldo" }]
	}
	if (pathname.includes("/e-wallet/top-up")) {
		return [{ label: "Dompet Digital", to: "/e-wallet" }, { label: "Isi Saldo" }]
	}
	if (pathname.includes("/e-wallet/edit-pin")) {
		return [{ label: "Dompet Digital", to: "/e-wallet" }, { label: "Pengaturan PIN" }]
	}
	if (pathname.includes("/e-wallet")) {
		return [{ label: "Dompet Digital" }]
	}
	if (pathname.includes("/profile")) {
		return [{ label: "Profil Merchant" }]
	}
	if (pathname.includes("/setting")) {
		return [{ label: "Pengaturan" }]
	}
	return [{ label: "Dompet Digital" }]
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
		const auth = useAuthStore()
		const navigate = useNavigate()
		const title = getTitleFromPath(location.pathname)
		const breadcrumbs = getBreadcrumbsFromPath(location.pathname)

		const handleLogout = (): void => {
			auth.logout()
			navigate({ to: "/login" })
		}

		return (
			<PageLayout
				header={
					<RojaHeader
						user={auth.user ? { name: auth.user.name, email: auth.user.email || "" } : null}
						roleLabel="MERCHANT"
						isAuthenticated={auth.isAuthenticated}
						onLogout={handleLogout}
					/>
				}
				showFooter={true}
				topBanner={<PageTitle title={title} breadcrumbs={breadcrumbs} />}
			>
				<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full">
					<div className="md:col-span-4 lg:col-span-3">
						<Sidebar />
					</div>
					<div className="md:col-span-8 lg:col-span-9 min-w-0">
						<Outlet />
					</div>
				</div>
			</PageLayout>
		)
	},
})

export default Route
