import type { JSX, FormEvent, ChangeEvent } from "react"
import { useState, useRef } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { RojaCard, Button, Input, DatePicker, Alert, AlertDescription } from "@roja/ui"
import {
	ArrowLeft,
	Calendar,
	Send,
	CheckCircle2,
	Upload,
	FileText,
	X,
} from "lucide-react"

const EwalletConfirmationPage = (): JSX.Element => {
	const navigate = useNavigate()
	const searchParams = (Route.useSearch() || {}) as { amount?: number; code?: string }

	const fileInputRef = useRef<HTMLInputElement>(null)

	const defaultAmount = searchParams.amount
		? new Intl.NumberFormat("id-ID").format(Number(searchParams.amount))
		: "100.000"

	// Form State matching legacy confirmation.blade.php
	const [ewalletId] = useState<string>("EW-2026001")
	const [trxCode] = useState<string>(searchParams.code || "TRX-2026001")
	const [amount] = useState<string>(defaultAmount)
	const [bankDestination] = useState<string>("BSI 7192852646 a.n Tabungan Pondok ROJA")
	const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0])
	const [paymentNote, setPaymentNote] = useState<string>("")
	const [file, setFile] = useState<File | null>(null)

	const [submitted, setSubmitted] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files?.[0]
		if (selected) {
			setFile(selected)
		}
	}

	const handleRemoveFile = () => {
		setFile(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setTimeout(() => {
			setLoading(false)
			setSubmitted(true)
		}, 600)
	}

	return (
		<div className="w-full">
			{submitted ? (
				<RojaCard className="p-8 text-center max-w-lg mx-auto rounded-2xl border-slate-100 bg-white shadow-xl">
					<div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
						<CheckCircle2 className="w-10 h-10" />
					</div>
					<h3 className="text-xl font-bold text-slate-800">Konfirmasi Berhasil Terkirim!</h3>
					<p className="text-xs text-slate-500 mt-2 leading-relaxed">
						Konfirmasi akan kami proses maksimal 1 x 24 jam. Bila ada pertanyaan segera hubungi pihak Pondok ROJA.
					</p>
					<Button
						type="button"
						onClick={() => navigate({ to: "/e-wallet" as any })}
						className="mt-6 rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 font-semibold"
					>
						Kembali ke Dashboard
					</Button>
				</RojaCard>
			) : (
				<RojaCard className="p-6 md:p-10 rounded-2xl shadow-sm border-slate-100 bg-white">
					{/* Header matching confirmation.blade.php */}
					<div className="border-b border-slate-100 pb-5 mb-8">
						<h3 className="text-xl font-bold text-slate-800">Konfirmasi</h3>
						<p className="text-xs text-slate-500 mt-1">
							Konfirmasi akan kami proses maksimal 1 x 24 jam. Bila ada pertanyaan segera hubungi pihak Pondok ROJA
						</p>
					</div>

					{/* Form matching confirmation.blade.php */}
					<form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
						{/* Row 1: ID eWallet & Transaction */}
						<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
							<label className="md:col-span-4 md:text-right font-medium text-xs text-slate-700">
								ID eWallet & Transaction
							</label>
							<div className="md:col-span-8 grid grid-cols-12 gap-3">
								<div className="col-span-5">
									<Input
										type="text"
										value={ewalletId}
										readOnly
										className="bg-slate-50 text-slate-600 font-mono text-xs h-10 rounded-xl border-slate-200"
									/>
								</div>
								<div className="col-span-7">
									<Input
										type="text"
										value={trxCode}
										readOnly
										className="bg-slate-50 text-slate-600 font-mono text-xs h-10 rounded-xl border-slate-200"
									/>
								</div>
							</div>
						</div>

						{/* Row 2: Nominal yang ditransfer */}
						<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
							<label className="md:col-span-4 md:text-right font-medium text-xs text-slate-700">
								Nominal yang ditransfer
							</label>
							<div className="md:col-span-8">
								<Input
									type="text"
									value={amount ? `Rp ${amount}` : ""}
									readOnly
									className="bg-slate-50 text-slate-800 font-bold text-sm h-10 rounded-xl border-slate-200"
								/>
							</div>
						</div>

						{/* Row 3: Bank Tujuan */}
						<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
							<label className="md:col-span-4 md:text-right font-medium text-xs text-slate-700">
								Bank Tujuan
							</label>
							<div className="md:col-span-8">
								<Input
									type="text"
									value={bankDestination}
									readOnly
									className="bg-slate-50 text-slate-800 font-medium text-xs h-10 rounded-xl border-slate-200"
								/>
							</div>
						</div>

						{/* Row 4: Tanggal Transfer */}
						<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
							<label className="md:col-span-4 md:text-right font-medium text-xs text-slate-700">
								Tanggal Transfer <span className="text-rose-500">*</span>
							</label>
							<div className="md:col-span-8">
								<DatePicker
									mode="single"
									value={paymentDate}
									onValueChange={(_, formattedStr) => setPaymentDate(formattedStr)}
								/>
							</div>
						</div>

						{/* Row 5: Keterangan */}
						<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
							<label className="md:col-span-4 md:text-right font-medium text-xs text-slate-700 pt-2">
								Keterangan
							</label>
							<div className="md:col-span-8">
								<textarea
									rows={5}
									value={paymentNote}
									onChange={(e) => setPaymentNote(e.target.value)}
									placeholder="Catatan tambahan (opsional)"
									className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e4007e]/20 focus:border-[#e4007e]"
								/>
							</div>
						</div>

						{/* Row 6: Bukti Transfer */}
						<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
							<label className="md:col-span-4 md:text-right font-medium text-xs text-slate-700">
								Bukti Transfer <span className="text-rose-500">*</span>
							</label>
							<div className="md:col-span-8">
								<div className="flex items-center gap-3">
									<Button
										type="button"
										variant="secondary"
										onClick={() => fileInputRef.current?.click()}
										className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 h-10 flex items-center gap-2"
									>
										<Upload className="w-4 h-4" />
										Upload
									</Button>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*,application/pdf"
										onChange={handleFileChange}
										className="hidden"
									/>
									{file ? (
										<div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
											<FileText className="w-4 h-4 text-[#e4007e]" />
											<span className="text-xs text-slate-700 font-medium max-w-[200px] truncate">
												{file.name}
											</span>
											<button
												type="button"
												onClick={handleRemoveFile}
												className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
											>
												<X className="w-3.5 h-3.5" />
											</button>
										</div>
									) : (
										<span className="text-xs text-slate-400">Belum ada file dipilih</span>
									)}
								</div>
							</div>
						</div>

						{/* Row 7: Submit Button */}
						<div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4">
							<div className="md:col-span-4" />
							<div className="md:col-span-8">
								<Button
									type="submit"
									disabled={loading}
									className="w-full h-11 rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white font-semibold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
								>
									<Send className="w-4 h-4" />
									{loading ? "Mengirim..." : "Kirim Sekarang"}
								</Button>
							</div>
						</div>
					</form>
				</RojaCard>
			)}
		</div>
	)
}

export const Route = createFileRoute("/_member/e-wallet/top-up/bank-transfer")({
	component: EwalletConfirmationPage,
})

export default EwalletConfirmationPage
