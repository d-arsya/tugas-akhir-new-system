import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { Users, Calendar, School, Receipt, ArrowRight } from "lucide-react"

export function DashboardQuickActions(): JSX.Element {
	const actions = [
		{
			to: "/users",
			label: "Pengguna & Staf",
			desc: "Hak akses & akun",
			icon: Users,
			iconBg: "bg-pink-50 text-[#e4007e]",
			hoverText: "group-hover:text-[#e4007e]",
		},
		{
			to: "/academic-years",
			label: "Tahun Akademik",
			desc: "Periode & semester",
			icon: Calendar,
			iconBg: "bg-emerald-50 text-emerald-600",
			hoverText: "group-hover:text-emerald-600",
		},
		{
			to: "/levels",
			label: "Jenjang & Kelas",
			desc: "Tsanawiyah, Aliyah, dsb.",
			icon: School,
			iconBg: "bg-violet-50 text-violet-600",
			hoverText: "group-hover:text-violet-600",
		},
		{
			to: "/settings",
			label: "Pengaturan Sekolah",
			desc: "Profil & formulir",
			icon: Receipt,
			iconBg: "bg-amber-50 text-amber-600",
			hoverText: "group-hover:text-amber-600",
		},
	]

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
			{actions.map((act) => {
				const Icon = act.icon
				return (
					<Link
						key={act.to}
						to={act.to}
						className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition group flex items-center justify-between border border-slate-100"
					>
						<div className="flex items-center gap-2.5 min-w-0">
							<div className={`w-8 h-8 rounded-lg ${act.iconBg} flex items-center justify-center shrink-0`}>
								<Icon className="w-4 h-4" />
							</div>
							<div className="min-w-0">
								<span className={`font-semibold text-slate-800 text-xs block truncate ${act.hoverText}`}>
									{act.label}
								</span>
								<span className="text-[11px] text-slate-500 block truncate">{act.desc}</span>
							</div>
						</div>
						<ArrowRight className={`w-3.5 h-3.5 text-slate-400 ${act.hoverText} group-hover:translate-x-0.5 transition shrink-0`} />
					</Link>
				)
			})}
		</div>
	)
}
