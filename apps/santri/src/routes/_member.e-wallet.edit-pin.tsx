import type { JSX } from "react"
import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { RojaCard, Button, Alert, AlertDescription, PinInput } from "@roja/ui"
import { KeyRound, ArrowLeft } from "lucide-react"
import { santriApi } from "@/lib/api"
import { useUpdatePinMutation } from "@/hooks/use-santri-queries"

const EditPinPage = (): JSX.Element => {
	const navigate = useNavigate()
	const updatePinMutation = useUpdatePinMutation()

	const [step, setStep] = useState<1 | 2 | 3>(1)
	const [prevPin, setPrevPin] = useState<string>("")
	const [newPin, setNewPin] = useState<string>("")
	const [confirmPin, setConfirmPin] = useState<string>("")

	const [error, setError] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)

	// Validate Current PIN
	const handleStep1Next = async () => {
		if (prevPin.length < 6) {
			setError("Masukkan 6 digit PIN lama terlebih dahulu.")
			return
		}
		setError("")
		setLoading(true)
		try {
			await santriApi.validateCurrentPin(prevPin)
			setStep(2)
		} catch (err: any) {
			setError(err.message || "PIN lama yang kamu masukkan salah.")
		} finally {
			setLoading(false)
		}
	}

	// Step 2 Next
	const handleStep2Next = () => {
		if (newPin.length < 6) {
			setError("Masukkan 6 digit PIN baru.")
			return
		}
		setError("")
		setStep(3)
	}

	// Reset Wizard
	const handleReset = () => {
		setNewPin("")
		setConfirmPin("")
		setError("")
		setStep(2)
	}

	// Submit PIN Update
	const handleStep3Submit = async () => {
		if (confirmPin.length < 6) {
			setError("Masukkan 6 digit PIN konfirmasi.")
			return
		}
		if (newPin !== confirmPin) {
			setError("PIN konfirmasi tidak sama dengan PIN baru.")
			return
		}
		setError("")
		updatePinMutation.mutate(
			{ prevPin, pin: newPin, pinConfirmation: confirmPin },
			{
				onSuccess: () => {
					navigate({ to: "/e-wallet" as any })
				},
				onError: (err: any) => {
					setError(err.message || "Gagal mengupdate PIN. Silakan coba lagi.")
				},
			},
		)
	}

	return (
		<div className="w-full">
			<div className="py-2">
				<RojaCard className="p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xl rounded-2xl border-slate-100 bg-white">
					<div className="flex flex-col items-center">
						<div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-6 shadow-inner">
							<KeyRound className="w-8 h-8 text-[#e4007e]" />
						</div>

						{step === 1 && (
							<>
								<h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
									Masukkan pin lama
								</h3>
								<p className="text-sm text-slate-500 mt-2 max-w-md">
									Demi keamanan, masukkan pin lama kamu terlebih dahulu ya.
								</p>

								{error && (
									<Alert variant="destructive" className="mt-4 text-xs py-2 max-w-sm">
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<div className="my-8 flex justify-center w-full">
									<PinInput value={prevPin} onChange={setPrevPin} length={6} />
								</div>

								<div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs mt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => navigate({ to: "/e-wallet" as any })}
										className="w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
									>
										<ArrowLeft className="w-4 h-4" />
										Batal
									</Button>
									<Button
										type="button"
										onClick={handleStep1Next}
										disabled={loading || prevPin.length < 6}
										className="w-full rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white text-xs font-semibold py-2.5 shadow-sm"
									>
										{loading ? "Memeriksa..." : "Lanjut"}
									</Button>
								</div>
							</>
						)}

						{step === 2 && (
							<>
								<h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
									Masukkan pin baru
								</h3>
								<p className="text-sm text-slate-500 mt-2 max-w-md">
									Masukkan 6 digit PIN baru untuk dompet digital kamu.
								</p>

								{error && (
									<Alert variant="destructive" className="mt-4 text-xs py-2 max-w-sm">
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<div className="my-8 flex justify-center w-full">
									<PinInput value={newPin} onChange={setNewPin} length={6} />
								</div>

								<div className="flex justify-center w-full max-w-xs mt-2">
									<Button
										type="button"
										onClick={handleStep2Next}
										disabled={newPin.length < 6}
										className="w-full rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white text-xs font-semibold py-2.5 shadow-sm"
									>
										Lanjut
									</Button>
								</div>
							</>
						)}

						{step === 3 && (
							<>
								<h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
									Ulangi pin baru
								</h3>
								<p className="text-sm text-slate-500 mt-2 max-w-md">
									Ketik ulang 6 digit PIN baru kamu untuk mengkonfirmasi.
								</p>

								{error && (
									<Alert variant="destructive" className="mt-4 text-xs py-2 max-w-sm">
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<div className="my-8 flex justify-center w-full">
									<PinInput value={confirmPin} onChange={setConfirmPin} length={6} />
								</div>

								<div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs mt-2">
									<Button
										type="button"
										variant="outline"
										onClick={handleReset}
										className="w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
									>
										Reset
									</Button>
									<Button
										type="button"
										onClick={handleStep3Submit}
										disabled={updatePinMutation.isPending || confirmPin.length < 6}
										className="w-full rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white text-xs font-semibold py-2.5 shadow-sm"
									>
										{updatePinMutation.isPending ? "Menyimpan..." : "Simpan PIN"}
									</Button>
								</div>
							</>
						)}
					</div>
				</RojaCard>
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_member/e-wallet/edit-pin")({
	component: EditPinPage,
})

export default EditPinPage
