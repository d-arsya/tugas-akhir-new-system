import { type JSX, useState } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react"
import { RojaCard, Button, PinInput } from "@roja/ui"
import { toast } from "sonner"

import { merchantApi } from "@/lib/api"

export const Route = createFileRoute("/_member/e-wallet/edit-pin")({
	component: EditPinRouteComponent,
})


function EditPinRouteComponent(): JSX.Element {
	const navigate = useNavigate()
	const [step, setStep] = useState<"current" | "new">("current")
	const [currentPin, setCurrentPin] = useState("")
	const [newPin, setNewPin] = useState("")
	const [confirmPin, setConfirmPin] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [hasError, setHasError] = useState(false)

	const handleCurrentSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (currentPin.length !== 6) return

		setIsSubmitting(true)
		setHasError(false)

		try {
			await merchantApi.loginEwalletPin(currentPin)
			setStep("new")
			toast.info("PIN Lama Terverifikasi", { description: "Silakan masukkan 6 digit PIN baru Anda." })
		} catch (err: unknown) {
			setHasError(true)
			setCurrentPin("")
			toast.error("PIN Lama Salah", { description: "PIN lama yang Anda masukkan tidak sesuai." })
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleNewSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (newPin.length !== 6 || confirmPin.length !== 6) return

		if (newPin !== confirmPin) {
			toast.error("Konfirmasi PIN Tidak Cocok", { description: "Pastikan PIN baru dan konfirmasi PIN sama persis." })
			return
		}

		setIsSubmitting(true)
		try {
			const res = await merchantApi.updatePin({
				currentPin,
				pin: newPin,
				pinConfirmation: confirmPin,
			})
			toast.success("PIN Berhasil Diperbarui", { description: res.message || "PIN E-Wallet Anda berhasil diubah." })
			navigate({ to: "/e-wallet" })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal memperbarui PIN"
			toast.error("Gagal Memperbarui PIN", { description: msg })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6 w-full mx-auto">
			<Link to="/e-wallet" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
				<ArrowLeft className="w-3.5 h-3.5" />
				Kembali ke Dompet Digital
			</Link>

			<RojaCard className="p-6 rounded-2xl border border-slate-200/80 text-center space-y-5 shadow-sm">
				<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#6866e9]/10 text-[#6866e9] mb-1">
					<KeyRound className="w-6 h-6" />
				</div>

				<div>
					<h5 className="text-lg font-bold text-slate-800">Ubah PIN E-Wallet</h5>
					<p className="text-xs text-slate-500 mt-1">
						{step === "current" ? "Masukkan PIN lama Anda terlebih dahulu" : "Masukkan 6 digit PIN baru dan konfirmasi"}
					</p>
				</div>

				{step === "current" ? (
					<form onSubmit={handleCurrentSubmit} className="space-y-5 mt-4">
						<PinInput value={currentPin} onChange={setCurrentPin} length={6} secure={true} error={hasError} disabled={isSubmitting} />
						<Button
							type="submit"
							disabled={currentPin.length !== 6 || isSubmitting}
							className="w-full h-11 bg-[#6866e9] hover:bg-[#6866e9]/90 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
						>
							{isSubmitting ? "Memverifikasi..." : "Verifikasi PIN Lama"}
						</Button>
					</form>
				) : (
					<form onSubmit={handleNewSubmit} className="space-y-4 mt-4">
						<div className="space-y-1">
							<p className="text-[11px] font-semibold text-slate-400">PIN Baru</p>
							<PinInput value={newPin} onChange={setNewPin} length={6} secure={true} disabled={isSubmitting} />
						</div>

						<div className="space-y-1">
							<p className="text-[11px] font-semibold text-slate-400">Konfirmasi PIN Baru</p>
							<PinInput value={confirmPin} onChange={setConfirmPin} length={6} secure={true} disabled={isSubmitting} />
						</div>

						<Button
							type="submit"
							disabled={newPin.length !== 6 || confirmPin.length !== 6 || isSubmitting}
							className="w-full h-11 bg-[#8dc31e] hover:bg-[#8dc31e]/90 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
						>
							{isSubmitting ? "Menyimpan..." : "Simpan PIN Baru"}
							<CheckCircle2 className="w-4 h-4" />
						</Button>
					</form>
				)}
			</RojaCard>
		</div>
	)
}

export default Route
