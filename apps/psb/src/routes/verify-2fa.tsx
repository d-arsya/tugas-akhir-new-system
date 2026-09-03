import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import Header from "@/components/header"

const schema = z.object({
	code: z.string().length(6, "Kode harus 6 digit angka"),
})

type Input = z.infer<typeof schema>

const Verify2faPage = (): JSX.Element => {
	const navigate = useNavigate()
	const login = useAuthStore((s) => s.login)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isResending, setIsResending] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [infoMsg, setInfoMsg] = useState<string | null>(null)

	const email = localStorage.getItem("roja-2fa-email") || ""

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Input>({
		resolver: zodResolver(schema),
		defaultValues: { code: "" },
	})

	const onSubmit = async (data: Input): Promise<void> => {
		if (!email) {
			navigate({ to: "/login" })
			return
		}
		setIsLoading(true)
		setErrorMsg(null)
		setInfoMsg(null)
		try {
			const res = await psbApi.verify2fa({ email, code: data.code })
			login(res.user)
			localStorage.removeItem("roja-2fa-email")
			navigate({ to: "/dashboard" })
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Kode verifikasi salah")
		} finally {
			setIsLoading(false)
		}
	}

	const handleResend = async (): Promise<void> => {
		if (!email) return
		setIsResending(true)
		setErrorMsg(null)
		setInfoMsg(null)
		try {
			const res = await psbApi.resend2fa(email)
			setInfoMsg(res.message || "Kode verifikasi 2FA telah dikirim ulang ke email Anda.")
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim ulang kode")
		} finally {
			setIsResending(false)
		}
	}

	return (
		<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
			<Header />
			<div className="roja_bg_blobs" />

			<main className="flex-1 relative z-10 px-4 py-8 max-w-md mx-auto w-full flex items-center justify-center">
				<div className="roja_card_wizard w-full relative overflow-hidden p-8 md:p-10 flex flex-col gap-6">
					{/* Corner gradient glows inside card */}
					<div className="absolute -top-12 -left-12 w-32 h-32 bg-[var(--primary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />
					<div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--secondary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />

					<div className="relative z-10 flex flex-col gap-2 items-center text-center">
						<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
							Verifikasi Dua Faktor (2FA)
						</div>
						<p className="text-xs text-[var(--body-txt-inverse)] m-0">
							Masukkan 6 digit kode verifikasi yang telah dikirim ke email{" "}
							<strong className="text-slate-700">{email}</strong>.
						</p>
					</div>

					{errorMsg && (
						<div className="relative z-10 p-3 bg-red-50 text-[var(--danger)] text-xs border border-red-200 rounded">
							{errorMsg}
						</div>
					)}

					{infoMsg && (
						<div className="relative z-10 p-3 bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 rounded">
							{infoMsg}
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="relative z-10 flex flex-col gap-4">
						<div className="form-group">
							<label className="control-label text-center block w-full mb-2">Kode Verifikasi</label>
							<input
								type="text"
								maxLength={6}
								className={`form-control text-center tracking-widest text-lg font-bold ${
									errors.code ? "is-invalid" : ""
								}`}
								placeholder="123456"
								{...register("code")}
							/>
							{errors.code && <span className="invalid-feedback text-center block">{errors.code.message}</span>}
						</div>

						<button
							type="submit"
							className="roja_btn roja_btn-primary roja_btn-lg w-full text-white bg-[var(--primary)] font-semibold"
							disabled={isLoading}
						>
							{isLoading ? "Memproses..." : "Verifikasi"}
						</button>
					</form>

					<div className="relative z-10 text-center text-xs text-[var(--grey)] border-t border-[var(--bg-form-border)] pt-4 flex justify-between items-center">
						<span>Tidak menerima kode?</span>
						<button
							type="button"
							onClick={handleResend}
							disabled={isResending}
							className="text-[var(--secondary)] hover:underline font-semibold text-xs"
						>
							{isResending ? "Mengirim..." : "Kirim Ulang Kode"}
						</button>
					</div>
				</div>
			</main>
		</div>
	)
}

export const Route = createFileRoute("/verify-2fa")({
	component: Verify2faPage,
})

export default Verify2faPage
