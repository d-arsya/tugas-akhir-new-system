import { type JSX, useState } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react"
import { RojaCard, Button, PinInput, toast } from "@roja/ui"

import { hijackMerchantApi } from "@/lib/dev-hijack"
import { createMerchantApi } from "@roja/api-client"

const merchantApi = hijackMerchantApi(createMerchantApi())

export const Route = createFileRoute("/_member/e-wallet/reset-pin")({
	component: ResetPinRouteComponent,
})

function ResetPinRouteComponent(): JSX.Element {
	const navigate = useNavigate()
	const [pin, setPin] = useState("")
	const [confirmPin, setConfirmPin] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (pin.length !== 6 || confirmPin.length !== 6) return

		if (pin !== confirmPin) {
			toast.error("Konfirmasi PIN Tidak Cocok")
			return
		}

		setIsSubmitting(true)
		try {
			const res = await merchantApi.resetPin({
				email: "merchant@pondokroja.ac.id",
				token: "mock-reset-pin-token",
				pin,
				pinConfirmation: confirmPin,
			})
			toast.success("Reset PIN Berhasil", { description: res.message })
			navigate({ to: "/e-wallet/login" })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal me-reset PIN"
			toast.error("Gagal", { description: msg })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6 max-w-md mx-auto">
			<Link to="/e-wallet/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
				<ArrowLeft className="w-3.5 h-3.5" />
				Kembali ke Login PIN
			</Link>

			<RojaCard className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-5 shadow-sm">
				<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#6866e9]/10 text-[#6866e9] mb-1">
					<KeyRound className="w-6 h-6" />
				</div>

				<div>
					<h2 className="text-lg font-bold text-slate-800 dark:text-white">Reset PIN E-Wallet Via Email</h2>
					<p className="text-xs text-slate-500 mt-1">Masukkan 6 digit PIN E-Wallet baru Anda</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1">
						<p className="text-[11px] font-semibold text-slate-400">PIN Baru</p>
						<PinInput value={pin} onChange={setPin} length={6} secure={true} disabled={isSubmitting} />
					</div>

					<div className="space-y-1">
						<p className="text-[11px] font-semibold text-slate-400">Konfirmasi PIN Baru</p>
						<PinInput value={confirmPin} onChange={setConfirmPin} length={6} secure={true} disabled={isSubmitting} />
					</div>

					<Button
						type="submit"
						disabled={pin.length !== 6 || confirmPin.length !== 6 || isSubmitting}
						className="w-full h-11 bg-[#6866e9] hover:bg-[#6866e9]/90 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
					>
						{isSubmitting ? "Menyimpan PIN..." : "Simpan PIN Baru"}
						<CheckCircle2 className="w-4 h-4" />
					</Button>
				</form>
			</RojaCard>
		</div>
	)
}

export default Route
