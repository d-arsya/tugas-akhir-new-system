import type { JSX, ReactNode } from "react"
import { Badge } from "@roja/ui"

export interface DashboardStatCardProps {
	title: string
	value: number | string
	icon: ReactNode
	iconBgClass?: string
	titleColorClass?: string
	valueColorClass?: string
	badgeText?: string
	badgeClass?: string
	actionLink?: ReactNode
}

export function DashboardStatCard({
	title,
	value,
	icon,
	iconBgClass = "bg-slate-100 text-slate-700",
	titleColorClass = "text-slate-500",
	valueColorClass = "text-slate-900",
	badgeText,
	badgeClass = "",
	actionLink,
}: DashboardStatCardProps): JSX.Element {
	return (
		<div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
			<div className="flex items-center justify-between">
				<span className={`text-xs font-semibold uppercase tracking-wider ${titleColorClass}`}>
					{title}
				</span>
				<div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBgClass}`}>
					{icon}
				</div>
			</div>
			<div className="mt-2 flex items-baseline justify-between">
				<span className={`text-2xl font-bold tracking-tight ${valueColorClass}`}>
					{value}
				</span>
				{badgeText && (
					<Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${badgeClass}`}>
						{badgeText}
					</Badge>
				)}
				{actionLink && actionLink}
			</div>
		</div>
	)
}
