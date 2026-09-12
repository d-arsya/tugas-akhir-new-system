import { type JSX, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Lock, KeyRound } from "lucide-react"
import { RojaCard, Button, PinInput } from "@roja/ui"
import { toast } from "sonner"

import { merchantApi } from "@/lib/api"
import useEwalletStore from "@/stores/ewalletStore"

export const Route = createFileRoute("/_member/e-wallet/login")({
	component: EwalletLoginRouteComponent,
})


function EwalletLoginRouteComponent(): JSX.Element {
	const navigate = useNavigate()
	const { setPinAuthenticated } = useEwalletStore()
	const [pin, setPin] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [hasError, setHasError] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (pin.length !== 6) return

		setIsSubmitting(true)
		setHasError(false)

		try {
			const res = await merchantApi.loginEwalletPin(pin)
			setPinAuthenticated(true)
			toast.success("PIN Terverifikasi", { description: res.message || "Dompet digital berhasil dibuka." })
			navigate({ to: "/e-wallet" })
		} catch (err: unknown) {
			setHasError(true)
			setPin("")
			const msg = err instanceof Error ? err.message : "PIN E-Wallet salah"
			toast.error("Verifikasi PIN Gagal", { description: msg })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="max-w-md mx-auto py-6">
			<RojaCard className="p-6 md:p-8 rounded-2xl border border-slate-200/80 text-center space-y-5 shadow-sm">
				<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8dc31e]/10 text-[#8dc31e] mb-1">
					<Lock className="w-7 h-7" />
				</div>

				<div>
					<h2 className="text-xl font-bold text-slate-800">Akses Dompet Digital</h2>
					<p className="text-xs text-slate-500 mt-1">Masukkan 6 digit PIN E-Wallet Merchant Anda</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<PinInput
						value={pin}
						onChange={setPin}
						length={6}
						secure={true}
						error={hasError}
						disabled={isSubmitting}
					/>

					<Button
						type="submit"
						disabled={pin.length !== 6 || isSubmitting}
						className="w-full h-11 bg-[#8dc31e] hover:bg-[#8dc31e]/90 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
					>
						{isSubmitting ? "Memverifikasi PIN..." : "Buka Dompet Digital"}
						<KeyRound className="w-4 h-4" />
					</Button>
				</form>
			</RojaCard>
		</div>
	)
}

export default Route
