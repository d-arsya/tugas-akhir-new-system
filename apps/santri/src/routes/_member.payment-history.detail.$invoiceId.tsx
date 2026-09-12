import { useState } from "react"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { RojaCard, Button } from "@roja/ui"
import { formatRupiah } from "@roja/utils"
import { ArrowLeft } from "lucide-react"
import TablePagination from "@/components/table-pagination"
import { useSantriInvoiceDetail } from "@/hooks/use-santri-queries"

const PaymentDetailPage = (): JSX.Element => {
	const navigate = useNavigate()
	const { invoiceId } = useParams({ from: "/_member/payment-history/detail/$invoiceId" })
	const [page, setPage] = useState<number>(1)

	const { data: invoice, isLoading } = useSantriInvoiceDetail(Number(invoiceId), page, 10)

	if (isLoading || !invoice) {
		return (
			<div className="py-12 text-center text-slate-400 text-sm font-medium">
				Memuat detail tagihan...
			</div>
		)
	}

	return (
		<div className="flex items-start gap-4 w-full">
			{/* Main Detail Card (matching detail-payment.blade.php) */}
			<RojaCard className="flex-1 p-6 md:p-8 flex flex-col gap-5 rounded-2xl shadow-sm border-slate-100 bg-white">
				{/* Top Card Intro Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex flex-col gap-0.5">
						<h3 className="text-base sm:text-lg font-bold text-slate-800">Detail Tagihan</h3>
						<p className="text-xs text-slate-500">
							Kami informasikan untuk detail tagihan {invoice.invoice.name}
						</p>
					</div>

					<div>
						{invoice.invoice.status === "paid" && (
							<span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
								Lunas
							</span>
						)}
						{invoice.invoice.status === "unpaid" && (
							<span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
								Belum Dibayar
							</span>
						)}
						{invoice.invoice.status === "installment" && (
							<span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
								Diangsur
							</span>
						)}
					</div>
				</div>

				<hr className="border-slate-100 my-1" />

				{/* 2-Column Info Grid: Detail Tagihan & Ditagihkan kepada */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-1">
					{/* Left: Detail Tagihan Attributes */}
					<div className="lg:col-span-7 flex flex-col gap-2">
						<p className="text-slate-400 font-semibold text-xs mb-2">Detail Tagihan</p>
						<table className="w-full text-xs">
							<tbody>
								<tr>
									<td className="text-slate-500 font-medium w-44 py-1.5 align-top whitespace-nowrap">
										Nama Tagihan
									</td>
									<td className="text-slate-800 font-semibold py-1.5 align-top">
										{invoice.invoice.name}
									</td>
								</tr>
								<tr>
									<td className="text-slate-500 font-medium w-44 py-1.5 align-top whitespace-nowrap">
										Biaya Tagihan
									</td>
									<td className="text-slate-800 font-semibold py-1.5 align-top">
										{formatRupiah(invoice.invoice.amount)}
									</td>
								</tr>
								<tr>
									<td className="text-slate-500 font-medium w-44 py-1.5 align-top whitespace-nowrap">
										Metode Pembayaran
									</td>
									<td className="text-slate-800 font-semibold py-1.5 align-top">
										{(invoice.invoice.paymentMethod === "installment") ? "Diangsur" : "Cash"}
									</td>
								</tr>
								<tr>
									<td className="text-slate-500 font-medium w-44 py-1.5 align-top whitespace-nowrap">
										Tanggal Tagihan
									</td>
									<td className="text-slate-800 font-semibold py-1.5 align-top">
										{invoice.invoice.dueDate ? new Date(invoice.invoice.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
									</td>
								</tr>
								{invoice.invoice.note && (
									<tr>
										<td className="text-slate-500 font-medium w-44 py-1.5 align-top whitespace-nowrap">
											Catatan
										</td>
										<td className="text-slate-800 font-semibold py-1.5 align-top italic">
											{invoice.invoice.note}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Right: Ditagihkan kepada */}
					<div className="lg:col-span-5 flex flex-col gap-2">
						<p className="text-slate-400 font-semibold text-xs mb-2">Ditagihkan Kepada</p>
						<table className="w-full text-xs">
							<tbody>
								<tr>
									<td className="text-slate-500 font-medium w-24 py-1.5 align-top">Nama</td>
									<td className="text-slate-800 font-semibold py-1.5 align-top">
										{invoice.student.fullName || "Santri"}
									</td>
								</tr>
								<tr>
									<td className="text-slate-500 font-medium w-24 py-1.5 align-top">NIS</td>
									<td className="text-slate-800 font-semibold py-1.5 align-top">
										{invoice.student.nis || "-"}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<hr className="border-slate-100 my-1" />

				{/* Transactions History Section */}
				<div className="flex flex-col gap-3">
					<p className="text-slate-400 font-semibold text-xs">Riwayat Transaksi Pembayaran</p>
					<div className="overflow-x-auto rounded-xl border border-slate-100">
						<table className="w-full text-left text-xs">
							<thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
								<tr>
									<th className="py-3 px-4 w-12">No</th>
									<th className="py-3 px-4">Keterangan</th>
									<th className="py-3 px-4">Tanggal Pembayaran</th>
									<th className="py-3 px-4 text-right">Nominal</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{(!invoice.transactions || invoice.transactions.length === 0) ? (
									<tr>
										<td colSpan={4} className="py-6 text-center text-slate-400">Belum ada riwayat transaksi pembayaran.</td>
									</tr>
								) : (
									invoice.transactions.map((tx, idx) => (
										<tr key={tx.id} className="hover:bg-slate-50/60">
											<td className="py-3 px-4 text-slate-500">{idx + 1}</td>
											<td className="py-3 px-4 font-medium text-slate-800">{tx.desc}</td>
											<td className="py-3 px-4 text-slate-600">
												{new Date(tx.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
											</td>
											<td className="py-3 px-4 text-right font-semibold text-slate-800">
												{formatRupiah(tx.amount)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					<TablePagination
						page={invoice.meta?.page || page}
						limit={invoice.meta?.limit || 10}
						total={invoice.meta?.total ?? (invoice.transactions?.length || 0)}
						totalPages={invoice.meta?.totalPages ?? (Math.ceil((invoice.transactions?.length || 0) / 10) || 1)}
						onPageChange={setPage}
					/>
				</div>

				{/* Back Action */}
				<div className="flex justify-between items-center mt-2 pt-4 border-t border-slate-100">
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/payment-history" as any })}
						className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Kembali ke Pembayaran
					</Button>
					<div className="text-right">
						<span className="text-xs text-slate-400 mr-2">Sisa Biaya:</span>
						<span className="text-sm font-bold text-[#e4007e]">
							{formatRupiah(invoice.costRemain ?? (invoice.amount - invoice.amountPaid))}
						</span>
					</div>
				</div>
			</RojaCard>
		</div>
	)
}

export const Route = createFileRoute("/_member/payment-history/detail/$invoiceId")({
	component: PaymentDetailPage,
})

export default PaymentDetailPage
