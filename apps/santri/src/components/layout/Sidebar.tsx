import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { ClipboardList, User, Settings, Wallet } from "lucide-react"

interface SidebarProps {
	className?: string
}

export const Sidebar = ({ className = "" }: SidebarProps): JSX.Element => {
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
					return (
						<Link
							key={item.to}
							to={item.to as any}
							className="group relative flex items-center gap-3.5 p-4 rounded-xl bg-white dark:bg-[#17283c] border border-slate-200/60 dark:border-slate-800/80 shadow-[0_3px_30px_rgba(104,102,233,0.08)] transition-all duration-300 hover:shadow-md cursor-pointer overflow-hidden"
							activeProps={{
								className: "font-semibold text-slate-900 dark:text-white border-[var(--primary)]/30",
							}}
							inactiveProps={{
								className: "text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white",
							}}
						>
							{/* Active / Hover Left Pink Accent Indicator Bar */}
							<span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.2 h-7 bg-[#e4007e] rounded-r-md opacity-0 group-hover:opacity-100 group-[.active]:opacity-100 transition-all duration-300" />

							{/* Icon */}
							<div
								className={`w-9 h-9 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
							>
								<Icon className="w-5 h-5" />
							</div>

							{/* Label */}
							<span className="text-xs tracking-wide">{item.label}</span>
						</Link>
					)
				})}
			</div>
		</aside>
	)
}

export default Sidebar
