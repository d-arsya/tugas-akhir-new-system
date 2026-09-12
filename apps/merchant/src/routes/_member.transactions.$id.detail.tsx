import { type JSX, useEffect, useState } from "react"
import { createFileRoute, useParams, Link } from "@tanstack/react-router"
import { ArrowLeft, Receipt, Store, Calendar, CreditCard, User } from "lucide-react"
import { RojaCard } from "@roja/ui"
import { formatRupiah, formatDateTime } from "@roja/utils"

import { hijackMerchantApi } from "@/lib/dev-hijack"
import { createMerchantApi } from "@roja/api-client"
import StatusBadge from "@/components/StatusBadge"

const merchantApi = hijackMerchantApi(createMerchantApi())

export const Route = createFileRoute("/_member/transactions/$id/detail")({
	component: TransactionDetailRouteComponent,
})

function TransactionDetailRouteComponent(): JSX.Element {
	const { id } = useParams({ from: "/_member/transactions/$id/detail" })
	const [tx, setTx] = useState<{
		id: number
		code: string
		name: string
		type: string
		amount: number
		status: string
		paymentMethod: string | null
		createdAt: string
		buyerName?: string
		items?: Array<{ id: number; description: string; price: number }>
	} | null>(null)

	useEffect(() => {
		const loadDetail = async () => {
			try {
				const res = await merchantApi.getTransactionDetail(Number(id))
				setTx(res)
			} catch (err) {
				// handled silently
			}
		}
		loadDetail()
	}, [id])

	if (!tx) return <div className="p-8 text-center text-xs text-slate-500">Memuat detail transaksi...</div>

	return (
		<div className="space-y-6 w-full mx-auto">
			<Link
				to="/e-wallet"
				className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
			>
				<ArrowLeft className="w-3.5 h-3.5" />
				Kembali Ke Dompet Digital
			</Link>

			<RojaCard className="p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-sm">
				{/* Receipt Header */}
				<div className="text-center border-b border-slate-100 dark:border-slate-800 pb-5">
					<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#e4007e]/10 text-[#e4007e] mb-2">
						<Receipt className="w-6 h-6" />
					</div>
					<h5 className="text-lg font-bold text-slate-800 dark:text-white">Rincian Transaksi</h5>
					<p className="text-xs font-mono font-semibold text-[#e4007e] mt-0.5">{tx.code}</p>
					<div className="mt-2">
						<StatusBadge status={tx.status} />
					</div>
				</div>

				{/* Details Meta */}
				<div className="grid grid-cols-2 gap-4 text-xs">
					<div className="space-y-1">
						<span className="text-slate-400 text-[11px] flex items-center gap-1">
							<Calendar className="w-3.5 h-3.5" /> Waktu Transaksi
						</span>
						<p className="font-semibold text-slate-700 dark:text-slate-200">{formatDateTime(tx.createdAt)}</p>
					</div>

					<div className="space-y-1">
						<span className="text-slate-400 text-[11px] flex items-center gap-1">
							<CreditCard className="w-3.5 h-3.5" /> Metode Pembayaran
						</span>
						<p className="font-semibold text-slate-700 dark:text-slate-200">{tx.paymentMethod || "E-Wallet PIN"}</p>
					</div>

					{tx.buyerName && (
						<div className="space-y-1 col-span-2">
							<span className="text-slate-400 text-[11px] flex items-center gap-1">
								<User className="w-3.5 h-3.5" /> Pembeli (Santri)
							</span>
							<p className="font-semibold text-slate-800 dark:text-white">{tx.buyerName}</p>
						</div>
					)}
				</div>

				{/* Item Breakdown if available */}
				{tx.items && tx.items.length > 0 && (
					<div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
						<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Detail Item Belanja</p>
						<div className="space-y-1.5 text-xs">
							{tx.items.map((item) => (
								<div key={item.id} className="flex justify-between py-1 border-b border-dashed border-slate-100 dark:border-slate-800/60">
									<span className="text-slate-700 dark:text-slate-300 font-medium">{item.description}</span>
									<span className="font-mono font-semibold text-slate-800 dark:text-white">{formatRupiah(item.price)}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Total Summary */}
				<div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
					<span className="text-xs font-bold text-slate-600 dark:text-slate-300">TOTAL BAYAR</span>
					<span className="text-xl font-extrabold text-[#e4007e] font-mono">{formatRupiah(tx.amount)}</span>
				</div>
			</RojaCard>
		</div>
	)
}

export default Route
