import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { ShieldAlert, ArrowRight } from "lucide-react"
import { formatRupiah } from "@roja/utils"

export interface DashboardArrearAlertProps {
	totalArrearCount: number
	totalArrears: number
}

export function DashboardArrearAlert({
	totalArrearCount,
	totalArrears,
}: DashboardArrearAlertProps): JSX.Element {
	if (totalArrearCount <= 0) return <></>

	return (
		<div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
			<div className="flex items-center gap-3 min-w-0">
				<div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
					<ShieldAlert className="w-4 h-4 text-amber-700" />
				</div>
				<div className="text-xs">
					<span className="font-semibold text-amber-950">
						Perhatian: Terdapat {totalArrearCount} Tagihan Tertunggak ({formatRupiah(totalArrears)})
					</span>
					<span className="text-amber-800 hidden md:inline ml-1.5">
						Segera tinjau status santri dan lakukan konfirmasi pembayaran.
					</span>
				</div>
			</div>

			<Link
				to="/reports/arrears"
				className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition shrink-0 self-end sm:self-auto"
			>
				<span>Tinjau</span>
				<ArrowRight className="w-3.5 h-3.5" />
			</Link>
		</div>
	)
}
