import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import type { StudentTransactionItem } from "@roja/types"
import { formatRupiah } from "@roja/utils"
import { toast } from "sonner"
import { CreditCard, Search, Printer, Filter } from "lucide-react"

export const Route = createFileRoute("/_auth/student-transactions")({
	component: StudentTransactionsPage,
})

function StudentTransactionsPage(): JSX.Element {
	const [search, setSearch] = useState("")
	const [methodFilter, setMethodFilter] = useState("ALL")
	const [receiptItem, setReceiptItem] = useState<StudentTransactionItem | null>(null)

	const { data, isLoading } = useQuery({
		queryKey: ["admin-student-transactions", search],
		queryFn: () => adminApi.getStudentTransactions({ ...(search ? { search } : {}) }),
	})

	const transactions = data?.data?.items || []

	const filteredTransactions = methodFilter === "ALL"
		? transactions
		: transactions.filter((t: StudentTransactionItem) => t.paymentMethod === methodFilter)

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Riwayat Transaksi Kasir"
				subtitle="Buku besar mutasi penerimaan pembayaran tagihan santri (Tunai, E-Wallet, dan Transfer Bank)"
			/>

			{/* Filter Toolbar */}
			<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<div className="w-full sm:w-80">
						<Input
							placeholder="Cari TRX / Invoice / Nama Santri..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="bg-slate-50 border-0"
						/>
					</div>

					<div className="flex items-center gap-2">
						<Filter className="w-4 h-4 text-slate-400" />
						<span className="text-xs text-slate-500 font-medium">Metode:</span>
						{["ALL", "CASH", "EWALLET", "TRANSFER"].map((m) => (
							<button
								key={m}
								type="button"
								onClick={() => setMethodFilter(m)}
								className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
									methodFilter === m
										? "bg-[var(--primary)] text-white"
										: "bg-slate-100 text-slate-600 hover:bg-slate-200"
								}`}
							>
								{m === "ALL" ? "Semua" : m === "CASH" ? "Tunai Kasir" : m === "EWALLET" ? "E-Wallet" : "Transfer Bank"}
							</button>
						))}
					</div>
				</div>
			</RojaCard>

			{/* Datatable */}
			<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
							<tr>
								<th className="p-4">No. Transaksi</th>
								<th className="p-4">No. Invoice</th>
								<th className="p-4">Nama Santri (NIS)</th>
								<th className="p-4">Kelas</th>
								<th className="p-4">Metode Bayar</th>
								<th className="p-4">Kasir / Petugas</th>
								<th className="p-4">Waktu Transaksi</th>
								<th className="p-4 text-right">Nominal (Rp)</th>
								<th className="p-4 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{filteredTransactions.length === 0 ? (
								<tr>
									<td colSpan={9} className="p-8 text-center text-slate-400">
										Tidak ada data transaksi penerimaan kasir.
									</td>
								</tr>
							) : (
								filteredTransactions.map((trx: StudentTransactionItem) => (
									<tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
										<td className="p-4 font-mono font-bold text-slate-900">{trx.transactionNumber}</td>
										<td className="p-4 font-mono font-medium text-emerald-700">{trx.invoiceNumber}</td>
										<td className="p-4">
											<div className="font-semibold text-slate-900">{trx.studentName}</div>
											<div className="text-[10px] text-slate-400 font-mono">{trx.nis}</div>
										</td>
										<td className="p-4 font-medium">{trx.gradeName}</td>
										<td className="p-4">
											<span
												className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
													trx.paymentMethod === "CASH"
														? "bg-emerald-50 text-emerald-700"
														: trx.paymentMethod === "EWALLET"
															? "bg-purple-50 text-purple-700"
															: "bg-sky-50 text-sky-700"
												}`}
											>
												{trx.paymentMethod}
											</span>
										</td>
										<td className="p-4 font-medium text-slate-700">{trx.cashierName}</td>
										<td className="p-4 text-slate-500">
											{new Date(trx.paidAt).toLocaleString("id-ID")}
										</td>
										<td className="p-4 text-right font-mono font-bold text-slate-900">
											{formatRupiah(trx.amount)}
										</td>
										<td className="p-4 text-right">
											<button
												type="button"
												onClick={() => setReceiptItem(trx)}
												className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
												title="Cetak Bukti Transaksi"
											>
												<Printer className="w-3.5 h-3.5" />
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</RojaCard>

			{/* Printable Transaction Receipt */}
			{receiptItem && (
				<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
								<Printer className="w-4 h-4 text-emerald-600" /> Bukti Pembayaran Transaksi
							</div>
							<button onClick={() => setReceiptItem(null)} className="text-slate-400 hover:text-slate-700">✕</button>
						</div>

						<div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-4 font-sans text-xs">
							<div className="text-center pb-3 border-b border-slate-200">
								<div className="font-bold text-sm text-slate-900 tracking-wide uppercase">PONDOK PESANTREN ROJA ISLAMIYYAH</div>
								<div className="text-[10px] text-slate-500">Struk Transaksi Pembayaran Kasir</div>
								<div className="font-mono font-bold text-slate-900 text-xs mt-1">{receiptItem.transactionNumber}</div>
							</div>

							<div className="space-y-1.5">
								<div className="flex justify-between">
									<span className="text-slate-400">No. Invoice:</span>
									<span className="font-mono font-bold text-slate-900">{receiptItem.invoiceNumber}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Nama Santri:</span>
									<span className="font-bold text-slate-900">{receiptItem.studentName} ({receiptItem.nis})</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Metode Pembayaran:</span>
									<span className="font-bold text-emerald-700 uppercase">{receiptItem.paymentMethod}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Kasir Pencatat:</span>
									<span className="font-semibold text-slate-800">{receiptItem.cashierName}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Waktu Bayar:</span>
									<span className="font-semibold text-slate-800">{new Date(receiptItem.paidAt).toLocaleString("id-ID")}</span>
								</div>
							</div>

							<div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-sm font-bold">
								<span>Nominal Diterima:</span>
								<span className="text-emerald-700">{formatRupiah(receiptItem.amount)}</span>
							</div>

							<div className="pt-2 text-[10px] text-slate-400 text-center">
								Struk ini adalah bukti sah pembayaran tagihan santri di loket kasir.
							</div>
						</div>

						<div className="flex justify-end gap-2 pt-2">
							<Button variant="outline" onClick={() => setReceiptItem(null)}>Tutup</Button>
							<Button
								onClick={() => {
									window.print()
									toast.success("Mencetak struk transaksi kasir...")
								}}
								className="bg-emerald-600 text-white gap-1.5"
							>
								<Printer className="w-4 h-4" /> Cetak Struk
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
