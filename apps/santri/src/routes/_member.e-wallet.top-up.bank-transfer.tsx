import type { JSX, FormEvent, ChangeEvent } from "react"
import { useState, useRef } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { RojaCard, Button, Input, DatePicker } from "@roja/ui"
import {
	Send,
	CheckCircle2,
	Upload,
	FileText,
	X,
	Info,
	Copy,
} from "lucide-react"
import { useSantriTopUpBankInfo, useSantriConfirmForm, useConfirmTopUpMutation } from "@/hooks/use-santri-queries"

const EwalletConfirmationPage = (): JSX.Element => {
	const navigate = useNavigate()
	const searchParams = (Route.useSearch() || {}) as {
		amount?: number
		code?: string
		transactionId?: number
		transferNewsNumber?: number
		totalAmount?: number
	}
	const targetId = Number(searchParams.transactionId) || 0

	const fileInputRef = useRef<HTMLInputElement>(null)

	const { data: bankInfo } = useSantriTopUpBankInfo()
	const { data: confirmData, isLoading: isConfirmLoading } = useSantriConfirmForm(targetId, targetId > 0)
	const confirmTopUpMutation = useConfirmTopUpMutation()

	const baseAmount = Number(confirmData?.amount || searchParams.amount || 0)
	const newsNumber = Number(confirmData?.transferNewsNumber || searchParams.transferNewsNumber || 0)
	const totalTransferAmount = searchParams.totalAmount
		? Number(searchParams.totalAmount)
		: baseAmount + newsNumber

	const formattedBaseAmount = new Intl.NumberFormat("id-ID").format(baseAmount)
	const formattedTotalAmount = new Intl.NumberFormat("id-ID").format(totalTransferAmount)

	const trxCode = confirmData?.code || searchParams.code || "-"
	const bankDestination = confirmData?.paymentAccount
		? `${confirmData.paymentAccount} a.n ${confirmData.paymentOnBehalfOf || "Tabungan Pondok ROJA"}`
		: bankInfo?.bankAccount || "BSI 7192852646 a.n Tabungan Pondok ROJA"

	const rawAccountNumber = (confirmData?.paymentAccount || bankInfo?.accountNumber || "7192852646").replace(/\D/g, "")

	const [copiedAccount, setCopiedAccount] = useState<boolean>(false)
	const [copiedAmount, setCopiedAmount] = useState<boolean>(false)

	const handleCopyAccount = () => {
		navigator.clipboard.writeText(rawAccountNumber)
		setCopiedAccount(true)
		setTimeout(() => setCopiedAccount(false), 2000)
	}

	const handleCopyAmount = () => {
		navigator.clipboard.writeText(String(totalTransferAmount))
		setCopiedAmount(true)
		setTimeout(() => setCopiedAmount(false), 2000)
	}

	const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0])
	const [paymentNote, setPaymentNote] = useState<string>("")
	const [file, setFile] = useState<File | null>(null)

	const [submitted, setSubmitted] = useState<boolean>(false)
	const [error, setError] = useState<string>("")

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
		if (!targetId) {
			setError("Transaksi top-up belum dibuat. Silakan lakukan isi saldo terlebih dahulu.")
			return
		}
		if (!file) {
			setError("Pilih file bukti transfer terlebih dahulu.")
			return
		}
		setError("")

		const formData = new FormData()
		formData.append("paymentDate", paymentDate)
		formData.append("payment_date", paymentDate)
		if (paymentNote) {
			formData.append("paymentNote", paymentNote)
			formData.append("payment_note", paymentNote)
		}
		formData.append("payment_attachment", file)
		formData.append("file", file)

		confirmTopUpMutation.mutate(
			{ id: targetId, formData },
			{
				onSuccess: () => {
					setSubmitted(true)
				},
				onError: (err: any) => {
					setError(err.message || "Gagal mengirimkan konfirmasi transfer.")
				},
			},
		)
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

					{error && (
						<div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
							{error}
						</div>
					)}

					{/* Form matching confirmation.blade.php */}
					<form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
						{/* Row 1: Kode Transaksi */}
						<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
							<label className="md:col-span-4 md:text-right font-medium text-xs text-slate-700">
								Kode Transaksi
							</label>
							<div className="md:col-span-8">
								<Input
									type="text"
									value={trxCode}
									readOnly
									className="bg-slate-50 text-slate-700 font-mono font-semibold text-xs h-10 rounded-xl border-slate-200"
								/>
							</div>
						</div>

						{/* Row 2: Nominal yang ditransfer */}
						<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
							<label className="md:col-span-4 md:text-right font-medium text-xs text-slate-700 pt-2.5">
								Nominal yang ditransfer
							</label>
							<div className="md:col-span-8 space-y-2">
								<div className="flex items-center gap-2">
									<Input
										type="text"
										value={totalTransferAmount > 0 ? `Rp ${formattedTotalAmount}` : ""}
										readOnly
										className="bg-slate-50 text-[#e4007e] font-bold text-base h-11 rounded-xl border-slate-200 flex-1"
									/>
									{totalTransferAmount > 0 && (
										<Button
											type="button"
											variant="outline"
											onClick={handleCopyAmount}
											className="h-11 px-3.5 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer"
											title="Salin Nominal Transfer"
										>
											<Copy className="w-3.5 h-3.5 text-[#e4007e]" />
											{copiedAmount ? "Tersalin!" : "Salin Nominal"}
										</Button>
									)}
								</div>

								{newsNumber > 0 && (
									<div className="p-3.5 bg-pink-50/60 border border-pink-100 rounded-xl text-xs space-y-1.5 text-slate-700">
										<div className="flex items-center gap-1.5 font-semibold text-[#e4007e]">
											<Info className="w-4 h-4 text-[#e4007e] shrink-0" />
											<span>Penjelasan Kode Unik Berita Transfer:</span>
										</div>
										<p className="text-[11px] leading-relaxed text-slate-600">
											Nominal isi saldo dasar adalah <strong>Rp {formattedBaseAmount}</strong> ditambah <strong>Rp {newsNumber}</strong> (kode unik berita transfer).
										</p>
										<p className="text-[11px] leading-relaxed text-slate-600">
											Mohon lakukan transfer tepat sebesar <strong>Rp {formattedTotalAmount}</strong> agar transaksi dapat langsung terverifikasi secara otomatis oleh sistem. Saldo E-Wallet yang akan masuk ke akun Anda tetap sebesar <strong>Rp {formattedBaseAmount}</strong>.
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Row 3: Bank Tujuan */}
						<div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
							<label className="md:col-span-4 md:text-right font-medium text-xs text-slate-700">
								Bank Tujuan
							</label>
							<div className="md:col-span-8 flex items-center gap-2">
								<Input
									type="text"
									value={bankDestination}
									readOnly
									className="bg-slate-50 text-slate-800 font-semibold text-xs h-10 rounded-xl border-slate-200 flex-1"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={handleCopyAccount}
									className="h-10 px-3.5 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer"
									title="Salin No. Rekening"
								>
									<Copy className="w-3.5 h-3.5 text-[#e4007e]" />
									{copiedAccount ? "Tersalin!" : "Salin Rekening"}
								</Button>
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
									disabled={confirmTopUpMutation.isPending}
									className="w-full h-11 rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white font-semibold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
								>
									<Send className="w-4 h-4" />
									{confirmTopUpMutation.isPending ? "Mengirim..." : "Kirim Sekarang"}
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
