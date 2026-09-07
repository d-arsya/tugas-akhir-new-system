import type { JSX } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { ClipboardList, User, Settings, Wallet } from "lucide-react"
import useAuthStore from "@/stores/auth.store"

interface SidebarProps {
	className?: string
}

export const Sidebar = ({ className = "" }: SidebarProps): JSX.Element => {
	const location = useLocation()
	const { user } = useAuthStore()

	const navItems = [
		{
			to: "/payment-history",
			label: "Pembayaran Santri",
			icon: ClipboardList,
			iconColor: "text-[#e4007e]",
			iconBg: "bg-[#e4007e]/10",
		},
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

	return (
		<aside className={`w-full flex flex-col gap-3 font-sans ${className}`}>
			<div className="flex flex-col gap-3">
				{navItems.map((item) => {
					const Icon = item.icon
					const isActive = location.pathname.startsWith(item.to)

					return (
						<Link
							key={item.to}
							to={item.to as any}
							className={`group relative flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white dark:bg-[#17283c] border border-slate-100/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ${
								isActive
									? "text-slate-900 dark:text-white font-bold"
									: "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200"
							}`}
						>
							{/* Left Pink Accent Active Line */}
							{isActive && (
								<span className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#e4007e] rounded-l-2xl" />
							)}

							<div className="flex items-center gap-3.5">
								{/* Icon */}
								<div
									className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
								>
									<Icon className="w-5 h-5" />
								</div>

								{/* Label */}
								<span className="text-xs tracking-wide">{item.label}</span>
							</div>

							{/* Optional Warning Badge Icon */}
							{item.showWarning && (
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
									<g transform="translate(-3 -3)">
										<circle cx="16" cy="16" r="16" transform="translate(3 3)" fill="#F8374B" opacity="0.3" />
										<rect width="3" height="13" rx="1" transform="translate(18 11)" fill="#F8374B" />
										<rect width="3" height="3" rx="1" transform="translate(18 26)" fill="#F8374B" />
									</g>
								</svg>
							)}
						</Link>
					)
				})}
			</div>
		</aside>
	)
}

export default Sidebar
