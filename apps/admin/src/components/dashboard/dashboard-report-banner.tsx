import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { Receipt, AlertTriangle, ArrowRight } from "lucide-react"

export function DashboardReportBanner(): JSX.Element {
	return (
		<div className="flex flex-wrap items-center gap-2.5">
			<Link
				to="/reports/income"
				className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#e4007e] text-white text-xs font-semibold hover:bg-[#c9006f] transition-colors shadow-xs"
			>
				<Receipt className="w-4 h-4" />
				<span>Laporan Pemasukan</span>
				<ArrowRight className="w-3.5 h-3.5 opacity-80" />
			</Link>

			<Link
				to="/reports/arrears"
				className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
			>
				<AlertTriangle className="w-4 h-4 text-rose-400" />
				<span>Laporan Tunggakan</span>
				<ArrowRight className="w-3.5 h-3.5 opacity-80" />
			</Link>
		</div>
	)
}
