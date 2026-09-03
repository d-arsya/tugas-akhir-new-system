import type { JSX } from "react"
import { useNavigate, createFileRoute, useSearch, Link } from "@tanstack/react-router"
import { useState } from "react"
import { psbApi } from "@/lib/api"
import Header from "@/components/header"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { z } from "zod"

const searchSchema = z.object({
	email: z.string().optional(),
})

const NeedVerifyPage = (): JSX.Element => {
	const navigate = useNavigate()
	const search = useSearch({ from: "/need-verify" }) as { email?: string }
	const email = search?.email || ""
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [infoMsg, setInfoMsg] = useState<string | null>(null)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const handleResend = async (): Promise<void> => {
		if (!email) {
			setErrorMsg("Alamat email tidak ditemukan. Silakan masuk kembali.")
			return
		}
		setIsLoading(true)
		setInfoMsg(null)
		setErrorMsg(null)
		try {
			const res = await psbApi.resendVerification(email)
			setInfoMsg(res.message || `Link verifikasi email baru telah berhasil dikirimkan ke ${email}.`)
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim ulang email verifikasi")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
			<Header />
			<div className="roja_bg_blobs" />

			<main className="flex-1 relative z-10 px-4 py-8 max-w-md mx-auto w-full flex items-center justify-center">
				<div className="roja_card_wizard w-full relative overflow-hidden p-8 md:p-10 flex flex-col gap-6 items-center text-center">
					{/* Corner gradient glows inside card */}
					<div className="absolute -top-12 -left-12 w-32 h-32 bg-[var(--primary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />
					<div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--secondary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />

					<div className="relative z-10 flex flex-col gap-3 items-center">
						<div className="w-14 h-14 rounded-full bg-amber-50 text-[var(--secondary)] flex items-center justify-center mb-1 border border-amber-200">
							<Mail className="w-7 h-7 text-[var(--secondary)]" />
						</div>
						<div className="text-sm font-bold text-slate-800 tracking-wide m-0">
							Verifikasi Email Diperlukan
						</div>
						<p className="text-xs text-[var(--body-txt-inverse)] leading-relaxed m-0">
							Akun pendaftaran Anda belum diverifikasi. Silakan periksa kotak masuk email{" "}
							{email ? <strong className="text-slate-800">{email}</strong> : "Anda"} dan klik link verifikasi untuk mengaktifkan akun Anda.
						</p>
					</div>

					{errorMsg && (
						<div className="relative z-10 p-3 bg-red-50 text-[var(--danger)] text-xs border border-red-200 rounded-lg w-full text-left">
							{errorMsg}
						</div>
					)}

					{infoMsg && (
						<div className="relative z-10 p-3 bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 rounded-lg w-full text-left flex items-start gap-2">
							<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
							<span>{infoMsg}</span>
						</div>
					)}

					<div className="relative z-10 flex flex-col gap-3 w-full pt-2 border-t border-[var(--bg-form-border)]">
						<button
							onClick={handleResend}
							disabled={isLoading}
							className="roja_btn roja_btn-primary roja_btn-lg w-full text-white bg-[var(--primary)] font-semibold flex items-center justify-center gap-2"
						>
							<Mail className="w-4 h-4" />
							<span>{isLoading ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}</span>
						</button>

						<Link
							to="/login"
							className="roja_btn roja_btn-secondary text-xs font-semibold flex items-center justify-center gap-2 py-2.5"
						>
							<ArrowLeft className="w-4 h-4" />
							<span>Kembali ke Halaman Login</span>
						</Link>
					</div>
				</div>
			</main>
		</div>
	)
}

export const Route = createFileRoute("/need-verify")({
	validateSearch: searchSchema,
	component: NeedVerifyPage,
})

export default NeedVerifyPage
