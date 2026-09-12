import type { JSX } from "react"
import { useState } from "react"
import { RojaCard, Button, Alert, AlertDescription, PinInput } from "@roja/ui"
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react"

interface CreateEwalletViewProps {
	onSubmit: (pin: string, pinConfirmation: string) => Promise<void>
	onCancel?: () => void
}

export const CreateEwalletView = ({
	onSubmit,
	onCancel,
}: CreateEwalletViewProps): JSX.Element => {
	const [step, setStep] = useState<1 | 2>(1)
	const [pin, setPin] = useState<string>("")
	const [pinConfirm, setPinConfirm] = useState<string>("")
	const [error, setError] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)

	const handleStep1Next = () => {
		if (pin.length < 6) {
			setError("Masukkan 6 digit PIN secara lengkap.")
			return
		}
		setError("")
		setStep(2)
	}

	const handleReset = () => {
		setPin("")
		setPinConfirm("")
		setError("")
		setStep(1)
	}

	const handleStep2Submit = async () => {
		if (pinConfirm.length < 6) {
			setError("Masukkan 6 digit PIN konfirmasi.")
			return
		}
		if (pin !== pinConfirm) {
			setError("PIN konfirmasi tidak sama dengan PIN pertama.")
			return
		}

		setError("")
		setLoading(true)
		try {
			await onSubmit(pin, pinConfirm)
		} catch (err: any) {
			setError(err.message || "Gagal membuat PIN. Silakan coba lagi.")
		} finally {
			setLoading(false)
		}
	}

	return (
		<RojaCard className="p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xl rounded-2xl border-slate-100 bg-white">
			<div className="flex flex-col items-center">
				<div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-6 shadow-inner">
					<KeyRound className="w-8 h-8 text-[#e4007e]" />
				</div>

				{step === 1 ? (
					<>
						<h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
							Biar aman, buat pin terlebih dahulu ya ...
						</h3>
						<p className="text-sm text-slate-500 mt-2 max-w-md">
							Pastikan yang mengetahui pin hanya kamu saja.
						</p>

						{error && (
							<Alert variant="destructive" className="mt-4 text-xs py-2">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="my-8">
							<PinInput
								value={pin}
								onChange={(val) => {
									setPin(val)
									if (error) setError("")
								}}
								error={!!error}
							/>
						</div>

						<div className="flex items-center justify-between w-full pt-4 border-t border-slate-100">
							{onCancel ? (
								<Button
									type="button"
									variant="outline"
									onClick={onCancel}
									className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
								>
									Batal
								</Button>
							) : (
								<div />
							)}
							<Button
								type="button"
								onClick={handleStep1Next}
								disabled={pin.length < 6}
								className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 font-semibold shadow-md hover:shadow-lg transition-all"
							>
								Selanjutnya
							</Button>
						</div>
					</>
				) : (
					<>
						<h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
							Konfirmasi pin
						</h3>
						<p className="text-sm text-slate-500 mt-2 max-w-md">
							Untuk memastikan kamu ingat, masukkan ulang pin di bawah ini ya.
						</p>

						{error && (
							<Alert variant="destructive" className="mt-4 text-xs py-2">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="my-8">
							<PinInput
								value={pinConfirm}
								onChange={(val) => {
									setPinConfirm(val)
									if (error) setError("")
								}}
								error={!!error}
							/>
						</div>

						<div className="flex items-center justify-between w-full pt-4 border-t border-slate-100">
							<Button
								type="button"
								variant="outline"
								onClick={handleReset}
								className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
							>
								Ulangi
							</Button>
							<Button
								type="button"
								onClick={handleStep2Submit}
								disabled={pinConfirm.length < 6 || loading}
								className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 font-semibold shadow-md hover:shadow-lg transition-all"
							>
								{loading ? "Menyimpan..." : "Selanjutnya"}
							</Button>
						</div>
					</>
				)}
			</div>
		</RojaCard>
	)
}

export default CreateEwalletView
