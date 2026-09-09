import type { JSX } from "react"
import useAuthStore from "@/stores/auth.store"
import { santriApi } from "@/lib/api"
import { useNavigate } from "@tanstack/react-router"
import { RojaHeader, type RojaHeaderMenuItem } from "@roja/ui"
import { LayoutDashboard, ClipboardList, Wallet, User, Settings } from "lucide-react"

export const Header = (): JSX.Element => {
	const auth = useAuthStore()
	const navigate = useNavigate()

	const handleLogout = async (): Promise<void> => {
		await santriApi.logout()
		auth.logout()
		navigate({ to: "/login" })
	}

	const menuItems: RojaHeaderMenuItem[] = [
		{
			label: "Dashboard",
			href: "/dashboard",
			icon: <LayoutDashboard className="w-4 h-4 text-[#e4007e]" />,
		},
		{
			label: "Pembayaran Santri",
			href: "/payment-history",
			icon: <ClipboardList className="w-4 h-4 text-[#e4007e]" />,
		},
		{
			label: "Dompet Digital",
			href: "/e-wallet",
			icon: <Wallet className="w-4 h-4 text-[#6866e9]" />,
		},
		{
			label: "Profil Saya",
			href: "/profile",
			icon: <User className="w-4 h-4 text-[#ffa800]" />,
		},
		{
			label: "Pengaturan",
			href: "/setting",
			icon: <Settings className="w-4 h-4 text-[#8dc31e]" />,
		},
	]

	return (
		<RojaHeader
			user={auth.user}
			roleLabel="SANTRI"
			isAuthenticated={auth.isAuthenticated}
			homeHref={auth.isAuthenticated ? "/dashboard" : "/login"}
			loginHref="/login"
			menuItems={menuItems}
			onLogout={handleLogout}
		/>
	)
}

export default Header
