import { type JSX, useState } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { Wallet, ArrowLeft, CheckCircle2 } from "lucide-react"
import { RojaCard, Button, PinInput } from "@roja/ui"
import { toast } from "sonner"

import { merchantApi } from "@/lib/api"
import useEwalletStore from "@/stores/ewalletStore"

export const Route = createFileRoute("/_member/e-wallet/create")({
	component: CreateEwalletRouteComponent,
})


function CreateEwalletRouteComponent(): JSX.Element {
	const navigate = useNavigate()
	const { setPinAuthenticated } = useEwalletStore()
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
			const res = await merchantApi.createEwallet({ pin, pinConfirmation: confirmPin })
			setPinAuthenticated(true)
			toast.success("E-Wallet Aktif!", { description: res.message })
			navigate({ to: "/e-wallet" })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal mengaktifkan E-Wallet"
			toast.error("Gagal", { description: msg })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6 max-w-md mx-auto">
			<Link to="/profile" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
				<ArrowLeft className="w-3.5 h-3.5" />
				Kembali ke Profil
			</Link>

			<RojaCard className="p-6 rounded-2xl border border-slate-200/80 text-center space-y-5 shadow-sm">
				<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#8dc31e]/10 text-[#8dc31e] mb-1">
					<Wallet className="w-6 h-6" />
				</div>

				<div>
					<h2 className="text-lg font-bold text-slate-800">Aktivasi Dompet Digital Merchant</h2>
					<p className="text-xs text-slate-500 mt-1">Buat 6 digit PIN E-Wallet untuk mengamankan akun e-wallet Anda</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1">
						<p className="text-[11px] font-semibold text-slate-400">PIN E-Wallet Baru</p>
						<PinInput value={pin} onChange={setPin} length={6} secure={true} disabled={isSubmitting} />
					</div>

					<div className="space-y-1">
						<p className="text-[11px] font-semibold text-slate-400">Konfirmasi PIN E-Wallet</p>
						<PinInput value={confirmPin} onChange={setConfirmPin} length={6} secure={true} disabled={isSubmitting} />
					</div>

					<Button
						type="submit"
						disabled={pin.length !== 6 || confirmPin.length !== 6 || isSubmitting}
						className="w-full h-11 bg-[#8dc31e] hover:bg-[#8dc31e]/90 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
					>
						{isSubmitting ? "Mengaktifkan..." : "Aktifkan E-Wallet Merchant"}
						<CheckCircle2 className="w-4 h-4" />
					</Button>
				</form>
			</RojaCard>
		</div>
	)
}

export default Route
