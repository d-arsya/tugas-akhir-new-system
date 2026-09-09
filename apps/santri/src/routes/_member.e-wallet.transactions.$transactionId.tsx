import type { JSX } from "react"
import { useState } from "react"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { RojaCard, Badge, Button, Alert, AlertDescription } from "@roja/ui"
import { formatRupiah } from "@roja/utils"
import { AlertCircle, CheckCircle2, Clock, XCircle, Copy, Receipt, Info } from "lucide-react"
import { useSantriTransactionDetail } from "@/hooks/use-santri-queries"

const TransactionDetailPage = (): JSX.Element => {
	const navigate = useNavigate()
	const { transactionId } = useParams({ from: "/_member/e-wallet/transactions/$transactionId" })

	const { data: tx, isLoading } = useSantriTransactionDetail(Number(transactionId))
	const [copied, setCopied] = useState<boolean>(false)

	const handleCopy = (text: string) => {
		navigator.clipboard.writeText(text)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	if (isLoading || !tx) {
		return (
			<div className="py-12 text-center text-slate-400 text-sm font-medium">
				Memuat detail transaksi...
			</div>
		)
	}

	const hasNewsNumber = Boolean(tx.transferNewsNumber && tx.transferNewsNumber > 0)
	const totalTransfer = hasNewsNumber ? Number(tx.amount) + Number(tx.transferNewsNumber) : Number(tx.amount)

	return (
		<div className="flex items-start gap-4 w-full">
			<div className="flex-1 flex flex-col gap-6">
				{/* Invalid Note Banner if Status is invalid */}
				{tx.status === "invalid" && tx.invalidNote && (
					<Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50 text-rose-900 p-4">
						<AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
						<div>
							<h5 className="font-bold text-sm">Info</h5>
							<AlertDescription className="text-xs mt-1 leading-relaxed">
								{tx.invalidNote}
							</AlertDescription>
						</div>
					</Alert>
				)}

				{/* Main Detail Receipt Card */}
				<RojaCard className="p-6 md:p-8 flex flex-col gap-6 rounded-2xl shadow-sm border-slate-100 bg-white">
					{/* Receipt Header */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-2xl bg-pink-50 text-[#e4007e]">
								<Receipt className="w-7 h-7" />
							</div>
							<div>
								<h3 className="text-lg font-bold text-slate-800">{tx.name}</h3>
								<p className="text-xs text-slate-500">Kode Transaksi: {tx.code}</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{tx.status === "valid" && (
								<Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1.5 px-3 py-1 text-xs">
									<CheckCircle2 className="w-3.5 h-3.5" /> Berhasil
								</Badge>
							)}
							{tx.status === "waiting" && (
								<Badge className="bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1.5 px-3 py-1 text-xs">
									<Clock className="w-3.5 h-3.5" /> Menunggu Pembayaran
								</Badge>
							)}
							{tx.status === "process" && (
								<Badge className="bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1.5 px-3 py-1 text-xs">
									<Clock className="w-3.5 h-3.5" /> Diproses
								</Badge>
							)}
							{tx.status === "invalid" && (
								<Badge className="bg-rose-50 text-rose-600 border-rose-200 flex items-center gap-1.5 px-3 py-1 text-xs">
									<XCircle className="w-3.5 h-3.5" /> Gagal
								</Badge>
							)}
						</div>
					</div>

					{/* Amount Banner */}
					<div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
						<div>
							<span className="text-xs font-semibold text-slate-500 block">Nominal Top-Up (Saldo Masuk)</span>
							{hasNewsNumber && (
								<span className="text-[11px] text-slate-400">Total transfer + kode unik: {formatRupiah(totalTransfer)}</span>
							)}
						</div>
						<span className="text-xl font-extrabold text-[#e4007e]">
							{formatRupiah(tx.amount)}
						</span>
					</div>

					{/* Explanatory Banner for Bank Transfer News Number */}
					{hasNewsNumber && (
						<div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-100 text-slate-700 flex items-start gap-3 text-xs">
							<Info className="w-5 h-5 text-[#e4007e] shrink-0 mt-0.5" />
							<div>
								<span className="font-bold block text-slate-800 mb-0.5">Penjelasan Kode Unik / Nomor Berita Transfer</span>
								<p className="text-slate-600 leading-relaxed">
									Nomor berita transfer (<strong>+{tx.transferNewsNumber}</strong>) ditambahkan ke nominal transfer sebagai kode unik untuk memudahkan verifikasi otomatis oleh admin. Saldo bersih yang ditambahkan ke akun E-Wallet Anda adalah sebesar <strong>{formatRupiah(tx.amount)}</strong>.
								</p>
							</div>
						</div>
					)}

					{/* Table Details */}
					<div className="w-full">
						<table className="w-full text-xs">
							<tbody className="divide-y divide-slate-100">
								<tr>
									<td className="text-slate-400 font-medium py-3 w-48">Kode Transaksi</td>
									<td className="text-slate-800 font-semibold py-3 flex items-center gap-2">
										<span>{tx.code}</span>
										<button
											type="button"
											onClick={() => handleCopy(tx.code)}
											className="text-slate-400 hover:text-[#e4007e] p-1 rounded-md hover:bg-slate-100 transition-colors"
										>
											<Copy className="w-3.5 h-3.5" />
										</button>
										{copied && <span className="text-[10px] text-emerald-600 font-bold">Tersalin!</span>}
									</td>
								</tr>
								<tr>
									<td className="text-slate-400 font-medium py-3">Metode Pembayaran</td>
									<td className="text-slate-800 font-semibold py-3">{tx.paymentMethod || "Bank Transfer"}</td>
								</tr>
								{hasNewsNumber && (
									<tr>
										<td className="text-slate-400 font-medium py-3">Kode Unik / Nomor Berita</td>
										<td className="text-[#e4007e] font-bold py-3">+{tx.transferNewsNumber}</td>
									</tr>
								)}
								{(tx.paymentAccount || tx.paymentOnBehalfOf) && (
									<tr>
										<td className="text-slate-400 font-medium py-3">Rekening Bank Tujuan</td>
										<td className="text-slate-800 font-semibold py-3">
											{tx.paymentAccount} {tx.paymentOnBehalfOf ? `a.n ${tx.paymentOnBehalfOf}` : ""}
										</td>
									</tr>
								)}
								{tx.paymentNote && (
									<tr>
										<td className="text-slate-400 font-medium py-3">Catatan Pembayaran</td>
										<td className="text-slate-800 font-semibold py-3 italic">{tx.paymentNote}</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Bottom Actions */}
					<div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/e-wallet" as any })}
							className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
						>
							Kembali ke Dashboard
						</Button>

						{tx.status === "waiting" && (
							<Button
								type="button"
								onClick={() =>
									navigate({
										to: "/e-wallet/top-up/bank-transfer" as any,
										search: {
											amount: tx.amount,
											code: tx.code,
											transactionId: tx.id,
											transferNewsNumber: tx.transferNewsNumber,
										} as any,
									})
								}
								className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white text-xs font-semibold shadow-sm"
							>
								Konfirmasi Transfer
							</Button>
						)}
					</div>
				</RojaCard>
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_member/e-wallet/transactions/$transactionId")({
	component: TransactionDetailPage,
})

export default TransactionDetailPage
