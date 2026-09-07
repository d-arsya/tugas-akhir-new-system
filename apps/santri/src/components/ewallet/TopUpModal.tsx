import type { JSX, FormEvent } from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@roja/ui"
import { Input } from "@roja/ui"
import { Wallet, HelpCircle, X } from "lucide-react"

interface TopUpModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess?: (amount: number) => void
}

export const TopUpModal = ({
	isOpen,
	onClose,
	onSuccess,
}: TopUpModalProps): JSX.Element | null => {
	const navigate = useNavigate()
	const [amount, setAmount] = useState<string>("")

	// Handle ESC key to close
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onClose()
			}
		}
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [isOpen, onClose])

	if (!isOpen) return null

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = e.target.value.replace(/\D/g, "")
		if (!rawValue) {
			setAmount("")
			return
		}
		const formatted = new Intl.NumberFormat("id-ID").format(Number(rawValue))
		setAmount(formatted)
	}

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault()
		const numericAmount = Number(amount.replace(/\D/g, ""))
		if (numericAmount > 0) {
			if (onSuccess) onSuccess(numericAmount)
			onClose()
			navigate({
				to: "/e-wallet/top-up/bank-transfer" as any,
				search: { amount: numericAmount } as any,
			})
		}
	}

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
			{/* Backdrop click to close */}
			<div className="fixed inset-0" onClick={onClose} />

			{/* Modal Card */}
			<div className="relative w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-200">
				{/* Close Icon Button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Header Icon & Titles */}
				<div className="flex flex-col items-center text-center">
					<div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-4 shadow-inner">
						<Wallet className="w-8 h-8 text-[#e4007e]" />
					</div>
					<h3 className="text-xl font-bold text-slate-800">
						Isi saldo
					</h3>
					<p className="text-xs text-slate-500 mt-1">
						Masukkan nominal yang ingin kamu kehendaki
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="mt-6 space-y-5">
					<div className="max-w-[280px] mx-auto">
						<div className="relative flex items-center">
							<span className="absolute left-4 text-slate-500 font-semibold text-sm">
								Rp
							</span>
							<Input
								type="text"
								inputMode="numeric"
								value={amount}
								onChange={handleAmountChange}
								placeholder="0"
								className="pl-11 text-center font-bold text-xl h-12 rounded-xl border-slate-200 focus:border-[#e4007e] focus:ring-[#e4007e]/20"
								autoFocus
							/>
						</div>
					</div>

					<div className="flex items-center justify-center gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 px-6 h-10 text-xs font-semibold"
						>
							Batal
						</Button>
						<Button
							type="submit"
							disabled={!amount || Number(amount.replace(/\D/g, "")) <= 0}
							className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-7 h-10 text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
						>
							Selanjutnya
						</Button>
					</div>

					<div className="border-t border-slate-100 pt-4 mt-6 text-center">
						<p className="text-[11px] text-slate-500 mb-2">
							Kamu belum tau langkah-langkah dalam mengisi saldo?
						</p>
						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								onClose()
								navigate({ to: "/e-wallet/top-up/bank-transfer" as any })
							}}
							className="text-xs text-[#e4007e] font-semibold hover:bg-pink-50 rounded-lg inline-flex items-center gap-1.5 h-8 px-3"
						>
							<HelpCircle className="w-4 h-4" />
							Baca Panduan
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default TopUpModal
