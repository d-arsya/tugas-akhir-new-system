import type { JSX } from "react"
import { useState, useEffect } from "react"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { RojaCard } from "@roja/ui"
import { santriApi } from "@/lib/api"
import type { SantriInvoiceDetailResponse } from "@roja/api-client/src/domains/santri.api"

const PaymentDetailPage = (): JSX.Element => {
	const navigate = useNavigate()
	const { invoiceId } = useParams({ from: "/_member/payment-history/detail/$invoiceId" })

	const [loading, setLoading] = useState<boolean>(true)
	const [invoice, setInvoice] = useState<SantriInvoiceDetailResponse | null>(null)

	useEffect(() => {
		const fetchInvoice = async () => {
			setLoading(true)
			try {
				const res = await santriApi.getInvoiceDetail(Number(invoiceId))
				setInvoice(res)
			} catch (err) {
				// Fallback
			} finally {
				setLoading(false)
			}
		}
		fetchInvoice()
	}, [invoiceId])

	const formatRupiah = (val: number): string => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(val)
	}

	if (loading || !invoice) {
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
							Kami informasikan untuk detail tagihan {invoice.name}
						</p>
					</div>

					<div>
						{invoice.status === "paid" && (
							<span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
								Lunas
							</span>
						)}
						{invoice.status === "unpaid" && (
							<span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
								Belum Dibayar
							</span>
						)}
						{invoice.status === "installment" && (
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
										{invoice.name}
									</td>
								</tr>
								<tr>
									<td className="text-slate-500 font-medium w-44 py-1.5 align-top whitespace-nowrap">
										Biaya Tagihan
									</td>
									<td className="text-slate-800 font-semibold py-1.5 align-top">
										{formatRupiah(invoice.amount)}
									</td>
								</tr>
								<tr>
									<td className="text-slate-500 font-medium w-44 py-1.5 align-top whitespace-nowrap">
										Tanggal Jatuh Tempo
									</td>
									<td className="text-slate-800 font-semibold py-1.5 align-top">
										{new Date(invoice.dueDate).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "long",
											year: "numeric",
										})}
									</td>
								</tr>
								{invoice.note && (
									<tr>
										<td className="text-slate-500 font-medium w-44 py-1.5 align-top whitespace-nowrap">
											Catatan
										</td>
										<td className="text-slate-800 font-semibold py-1.5 align-top">
											{invoice.note}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Right: Ditagihkan kepada */}
					<div className="lg:col-span-5 flex flex-col gap-2">
						<p className="text-slate-400 font-semibold text-xs mb-2">Ditagihkan kepada</p>
						<table className="w-full text-xs">
							<tbody>
								<tr>
									<td className="text-slate-800 font-semibold py-1.5">
										{invoice.studentName}
									</td>
								</tr>
								<tr>
									<td className="text-slate-800 font-semibold py-1.5">
										{invoice.studentNis}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Breakdown Cost Table (matching cost-table & table-style in custom-detail.css) */}
				<div className="rounded-xl border-2 border-[#f7f7f7] bg-[#f7f7f7] overflow-x-auto my-2">
					<table className="w-full text-xs min-w-[500px]">
						<thead>
							<tr className="bg-[#f7f7f7]">
								<th className="py-3 px-5 text-left font-normal text-slate-500">Keterangan</th>
								<th className="py-3 px-5 text-left font-normal text-slate-500">Dibayar tanggal</th>
								<th className="py-3 px-5 text-right font-normal text-slate-500">Jumlah</th>
							</tr>
						</thead>
						<tbody>
							{invoice.transactions.length === 0 ? (
								<tr className="bg-white">
									<td colSpan={3} className="py-6 text-center text-slate-400 border-t-2 border-[#f7f7f7]">
										Belum ada transaksi untuk tagihan ini.
									</td>
								</tr>
							) : (
								invoice.transactions.map((tx) => (
									<tr key={tx.id} className="bg-white border-t-2 border-[#f7f7f7]">
										<td className="py-3 px-5 text-slate-800 font-medium">{tx.desc}</td>
										<td className="py-3 px-5 text-slate-600">
											{new Date(tx.paidAt).toLocaleDateString("id-ID", {
												day: "numeric",
												month: "long",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</td>
										<td className="py-3 px-5 text-right font-semibold text-slate-800">
											{formatRupiah(tx.amount)}
										</td>
									</tr>
								))
							)}
						</tbody>
						<tfoot>
							<tr className="bg-[#f7f7f7] font-semibold text-slate-500 border-t-2 border-[#f7f7f7]">
								<th colSpan={2} className="py-3.5 px-5 text-left font-semibold text-slate-600">
									Sisa yang harus dibayar
								</th>
								<th className="py-3.5 px-5 text-right font-bold text-rose-600">
									{formatRupiah(invoice.costRemain > 0 ? invoice.costRemain : 0)}
								</th>
							</tr>
						</tfoot>
					</table>
				</div>

				<p className="text-slate-400 text-xs mt-1">
					Jika ada pertanyaan terkait tagihan ini, silakan langsung menghubungi bagian pembayaran PONDOK ROJA
				</p>
			</RojaCard>

			{/* Floating Back Button (matching tbr_btn-back in detail-payment.blade.php) */}
			<button
				type="button"
				onClick={() => navigate({ to: "/payment-history" as any })}
				className="hidden lg:flex w-10 h-10 min-w-10 rounded-xl bg-white shadow-md border border-slate-100 items-center justify-center text-[#6866e9] hover:bg-slate-50 transition-colors"
				title="Kembali"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
					<path d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" />
					<rect width="2" height="14" rx="1" transform="translate(5 13) rotate(-90)" fill="#6866e9" opacity="0.3" />
					<path d="M3.707,15.707a1,1,0,0,1-1.414-1.414l6-6a1,1,0,0,1,1.383-.03l6,5.5a1,1,0,1,1-1.351,1.474L9.03,10.384Z" transform="translate(-3 21) rotate(-90)" fill="#6866e9" />
				</svg>
			</button>
		</div>
	)
}

export const Route = createFileRoute("/_member/payment-history/detail/$invoiceId")({
	component: PaymentDetailPage,
})

export default PaymentDetailPage
