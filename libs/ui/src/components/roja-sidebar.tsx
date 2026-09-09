import type { JSX, ComponentType } from "react"
import { Link, useLocation } from "@tanstack/react-router"

export interface RojaSidebarItem {
	to: string
	label: string
	icon: ComponentType<{ className?: string }>
	iconColor?: string
	iconBg?: string
	showWarning?: boolean
}

export interface RojaSidebarProps {
	navItems: RojaSidebarItem[]
	className?: string
}

export const RojaSidebar = ({ navItems, className = "" }: RojaSidebarProps): JSX.Element => {
	const location = useLocation()

	return (
		<aside className={`w-full flex flex-col gap-3 font-sans ${className}`}>
			<div className="flex flex-col gap-3">
				{navItems.map((item) => {
					const Icon = item.icon
					const isActive = location.pathname.startsWith(item.to)
					const iconColor = item.iconColor || "text-[var(--primary)]"
					const iconBg = item.iconBg || "bg-[var(--primary)]/10"

					return (
						<Link
							key={item.to}
							to={item.to as any}
							className={`group relative flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white dark:bg-[#17283c] border-0 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden outline-none focus:outline-none focus-visible:outline-none ring-0 ${
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
									className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
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

export default RojaSidebar
