import type { JSX } from "react"
import { User, Settings, Wallet } from "lucide-react"
import useAuthStore from "@/stores/authStore"
import { RojaSidebar, type RojaSidebarItem } from "@roja/ui"

export interface SidebarProps {
	className?: string
}

export const Sidebar = ({ className = "" }: SidebarProps): JSX.Element => {
	const { user } = useAuthStore()

	// 1:1 Legacy Sidebar Menu Items (Exact 3 items matching sidebar-left.blade.php)
	const navItems: RojaSidebarItem[] = [
		{
			to: "/profile",
			label: "Profil Saya",
			icon: User,
			iconColor: "text-[#ffa800]",
			iconBg: "bg-[#ffa800]/10",
		},
		{
			to: "/setting",
			label: "Pengaturan",
			icon: Settings,
			iconColor: "text-[#8dc31e]",
			iconBg: "bg-[#8dc31e]/10",
			showWarning: !user?.email,
		},
		{
			to: "/e-wallet",
			label: "Dompet Digital",
			icon: Wallet,
			iconColor: "text-[#6866e9]",
			iconBg: "bg-[#6866e9]/10",
		},
	]

	return <RojaSidebar navItems={navItems} className={className} />
}

export default Sidebar
