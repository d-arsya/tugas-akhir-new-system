import type { JSX } from "react"
import useAuthStore from "@/stores/auth.store"
import { psbApi } from "@/lib/api"
import { useNavigate } from "@tanstack/react-router"
import { RojaHeader, type RojaHeaderMenuItem } from "@roja/ui"
import { LayoutDashboard, FileText, Settings } from "lucide-react"

export const Header = (): JSX.Element => {
	const auth = useAuthStore()
	const navigate = useNavigate()

	const handleLogout = async (): Promise<void> => {
		await psbApi.logout()
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
			label: "Pengaturan Akun",
			href: "/settings",
			icon: <Settings className="w-4 h-4 text-[#8dc31e]" />,
		},
	]

	return (
		<RojaHeader
			user={auth.user}
			roleLabel="PENDAFTAR"
			isAuthenticated={auth.isAuthenticated}
			homeHref={auth.isAuthenticated ? "/dashboard" : "/"}
			loginHref="/login"
			menuItems={menuItems}
			onLogout={handleLogout}
		/>
	)
}

export default Header
