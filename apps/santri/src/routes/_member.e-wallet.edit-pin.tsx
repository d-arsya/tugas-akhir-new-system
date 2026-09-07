import type { JSX } from "react"
import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { RojaCard, Button, Alert, AlertDescription } from "@roja/ui"
import { KeyRound, ArrowLeft } from "lucide-react"
import PinInput from "@/components/ewallet/PinInput"
import { santriApi } from "@/lib/api"

const EditPinPage = (): JSX.Element => {
	const navigate = useNavigate()

	const [step, setStep] = useState<1 | 2 | 3>(1)
	const [prevPin, setPrevPin] = useState<string>("")
	const [newPin, setNewPin] = useState<string>("")
	const [confirmPin, setConfirmPin] = useState<string>("")

	const [error, setError] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)

	// Validate Prev PIN
	const handleStep1Next = async () => {
		if (prevPin.length < 6) {
			setError("Masukkan 6 digit PIN lama terlebih dahulu.")
			return
		}
		setError("")
		setLoading(true)
		try {
			await santriApi.validatePrevPin(prevPin)
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
		setLoading(true)
		try {
			await santriApi.updatePin({ prevPin, pin: newPin, pinConfirmation: confirmPin })
			navigate({ to: "/e-wallet" as any })
		} catch (err: any) {
			setError(err.message || "Gagal mengupdate PIN. Silakan coba lagi.")
		} finally {
			setLoading(false)
		}
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

								<div className="my-8">
									<PinInput
										value={prevPin}
										onChange={(val) => {
											setPrevPin(val)
											if (error) setError("")
										}}
										error={!!error}
										disabled={loading}
									/>
								</div>

								<div className="flex items-center justify-between w-full pt-4 border-t border-slate-100">
									<p className="text-xs text-slate-500">
										Kamu lupa?{" "}
										<button
											type="button"
											onClick={() => alert("Instruksi reset PIN dikirim ke email kamu.")}
											className="text-[#e4007e] font-semibold hover:underline cursor-pointer"
										>
											reset pin
										</button>
									</p>
									<Button
										type="button"
										onClick={handleStep1Next}
										disabled={prevPin.length < 6 || loading}
										className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 font-semibold shadow-md hover:shadow-lg transition-all"
									>
										{loading ? "Memverifikasi..." : "Selanjutnya"}
									</Button>
								</div>
							</>
						)}

						{step === 2 && (
							<>
								<h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
									Pengaturan Pin
								</h3>
								<p className="text-sm text-slate-500 mt-2 max-w-md">
									Biar dompet kamu aman, pastikan kamu menggantinya secara berkala ya.
								</p>

								{error && (
									<Alert variant="destructive" className="mt-4 text-xs py-2 max-w-sm">
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<div className="my-8">
									<PinInput
										value={newPin}
										onChange={(val) => {
											setNewPin(val)
											if (error) setError("")
										}}
										error={!!error}
									/>
								</div>

								<div className="flex items-center justify-between w-full pt-4 border-t border-slate-100">
									<Button
										type="button"
										variant="outline"
										onClick={() => navigate({ to: "/e-wallet" as any })}
										className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
									>
										Batal
									</Button>
									<Button
										type="button"
										onClick={handleStep2Next}
										disabled={newPin.length < 6}
										className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 font-semibold shadow-md hover:shadow-lg transition-all"
									>
										Selanjutnya
									</Button>
								</div>
							</>
						)}

						{step === 3 && (
							<>
								<h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
									Konfirmasi pin
								</h3>
								<p className="text-sm text-slate-500 mt-2 max-w-md">
									Untuk memastikan kamu ingat, masukkan ulang pin di bawah ini ya.
								</p>

								{error && (
									<Alert variant="destructive" className="mt-4 text-xs py-2 max-w-sm">
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<div className="my-8">
									<PinInput
										value={confirmPin}
										onChange={(val) => {
											setConfirmPin(val)
											if (error) setError("")
										}}
										error={!!error}
										disabled={loading}
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
										onClick={handleStep3Submit}
										disabled={confirmPin.length < 6 || loading}
										className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 font-semibold shadow-md hover:shadow-lg transition-all"
									>
										{loading ? "Menyimpan..." : "Selanjutnya"}
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
