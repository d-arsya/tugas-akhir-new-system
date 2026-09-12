import type { JSX } from "react"
import { Receipt } from "lucide-react"
import { formatRupiah } from "@roja/utils"

interface TotalSectionProps {
	itemCount: number
	totalAmount: number
}

export default function TotalSection({ itemCount, totalAmount }: TotalSectionProps): JSX.Element {
	return (
		<div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-850 space-y-2">
			<div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide pb-1">
				<Receipt className="w-4 h-4 text-[#8dc31e]" />
				<span>Total Transaksi</span>
			</div>

			<div className="space-y-1.5 text-xs text-slate-500">
				<div className="flex justify-between">
					<span>Jumlah Barang</span>
					<span className="font-semibold text-slate-700 dark:text-slate-300">{itemCount} item</span>
				</div>

				<div className="pt-2 border-t border-slate-200 dark:border-slate-750 flex items-baseline justify-between">
					<span className="text-xs font-bold uppercase text-slate-800 dark:text-slate-100">Total Pembayaran</span>
					<span className="text-2xl sm:text-3xl font-extrabold text-[#8dc31e] font-mono tracking-tight">
						{formatRupiah(totalAmount)}
					</span>
				</div>
			</div>
		</div>
	)
}
