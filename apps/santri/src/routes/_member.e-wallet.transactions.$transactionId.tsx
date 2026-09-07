import type { JSX } from "react"
import { useState, useEffect } from "react"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { RojaCard, Badge, Button, Alert, AlertDescription } from "@roja/ui"
import { AlertCircle, CheckCircle2, Clock, XCircle, Copy, Receipt } from "lucide-react"
import { santriApi } from "@/lib/api"
import type { SantriTransactionDetailResponse } from "@roja/api-client/src/domains/santri.api"

const TransactionDetailPage = (): JSX.Element => {
	const navigate = useNavigate()
	const { transactionId } = useParams({ from: "/_member/e-wallet/transactions/$transactionId" })

	const [loading, setLoading] = useState<boolean>(true)
	const [tx, setTx] = useState<SantriTransactionDetailResponse | null>(null)
	const [copied, setCopied] = useState<boolean>(false)

	useEffect(() => {
		const fetchDetail = async () => {
			setLoading(true)
			try {
				const res = await santriApi.getTransactionDetail(Number(transactionId))
				setTx(res)
			} catch (err) {
				// Fallback error
			} finally {
				setLoading(false)
			}
		}
		fetchDetail()
	}, [transactionId])

	const formatRupiah = (val: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(val)
	}

	const handleCopy = (text: string) => {
		navigator.clipboard.writeText(text)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	if (loading || !tx) {
		return (
			<div className="py-12 text-center text-slate-400 text-sm font-medium">
				Memuat detail transaksi...
			</div>
		)
	}

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
							<p className="text-xs text-slate-500">
								{new Date(tx.createdAt).toLocaleDateString("id-ID", {
									weekday: "long",
									day: "numeric",
									month: "long",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</p>
						</div>
					</div>

					<div>
						{tx.status === "valid" && (
							<Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 px-3 py-1 text-xs">
								<CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Berhasil
							</Badge>
						)}
						{tx.status === "invalid" && (
							<Badge className="bg-rose-50 text-rose-600 border-rose-200 px-3 py-1 text-xs">
								<XCircle className="w-3.5 h-3.5 mr-1" /> Gagal
							</Badge>
						)}
						{tx.status === "waiting" && (
							<Badge className="bg-amber-50 text-amber-600 border-amber-200 px-3 py-1 text-xs">
								<Clock className="w-3.5 h-3.5 mr-1" /> Menunggu
							</Badge>
						)}
					</div>
				</div>

				{/* Breakdown Attributes */}
				<div className="bg-slate-50/70 p-5 rounded-xl space-y-3.5 text-xs text-slate-700">
					<div className="flex items-center justify-between">
						<span className="text-slate-500 font-medium">ID Transaksi</span>
						<div className="flex items-center gap-2">
							<span className="font-mono font-bold text-slate-900">{tx.code}</span>
							<button
								onClick={() => handleCopy(tx.code)}
								className="text-slate-400 hover:text-slate-600 p-1"
								title="Copy Kode"
							>
								<Copy className="w-3.5 h-3.5" />
							</button>
							{copied && <span className="text-[10px] text-emerald-600 font-bold">Tersalin!</span>}
						</div>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-slate-500 font-medium">Metode Pembayaran</span>
						<span className="font-semibold text-slate-800">{tx.paymentMethod}</span>
					</div>

					{tx.bankAccount && (
						<div className="flex items-center justify-between">
							<span className="text-slate-500 font-medium">Rekening Tujuan</span>
							<span className="font-semibold text-slate-800">{tx.bankAccount}</span>
						</div>
					)}

					<div className="border-t border-slate-200/80 pt-3 flex items-center justify-between text-sm">
						<span className="font-bold text-slate-800">Total Nominal</span>
						<span
							className={`font-extrabold ${
								tx.type === "income" ? "text-emerald-600" : "text-slate-900"
							}`}
						>
							{tx.type === "income" ? "+" : "-"} {formatRupiah(tx.amount)}
						</span>
					</div>
				</div>

				{/* User Note if exists */}
				{tx.paymentNote && (
					<div className="text-center p-4 rounded-xl border border-dashed border-slate-200">
						<p className="text-xs text-slate-400 font-medium mb-1">Catatan Kamu</p>
						<p className="text-xs text-slate-700 font-medium">{tx.paymentNote}</p>
					</div>
				)}

				<div className="border-t border-slate-100 pt-4 text-center">
					<p className="text-xs text-slate-500">
						Jika ada pertanyaan terkait transaksi ini, silakan langsung menghubungi bagian pembayaran Pondok ROJA.
					</p>
				</div>
			</RojaCard>
		</div>

		{/* Floating Back Button (matching tbr_btn-back in transaction-detail.blade.php) */}
		<button
			type="button"
			onClick={() => navigate({ to: "/e-wallet" as any })}
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

export const Route = createFileRoute("/_member/e-wallet/transactions/$transactionId")({
	component: TransactionDetailPage,
})

export default TransactionDetailPage
