import type { JSX } from "react"
import { useNavigate, createFileRoute, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { psbApi } from "@/lib/api"
import Header from "@/components/header"
import { z } from "zod"

const searchSchema = z.object({
	token: z.string().optional(),
	email: z.string().optional(),
})

const EmailVerifyPage = (): JSX.Element => {
	const navigate = useNavigate()
	const search = useSearch({ from: "/email-verify" }) as { token?: string; email?: string }
	const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
	const [message, setMessage] = useState<string>("")

	useEffect(() => {
		const token = search?.token
		if (!token) {
			setStatus("error")
			setMessage("Token verifikasi email tidak ditemukan.")
			return
		}

		psbApi
			.verifyEmail(token)
			.then((res) => {
				setStatus("success")
				setMessage(res.message || "Alamat email Anda telah berhasil diverifikasi. Silakan masuk ke Member Area.")
			})
			.catch((err: unknown) => {
				setStatus("error")
				setMessage(err instanceof Error ? err.message : "Gagal memverifikasi email.")
			})
	}, [search?.token])

	return (
		<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
			<Header />
			<div className="roja_bg_blobs" />

			<main className="flex-1 relative z-10 px-4 py-8 max-w-md mx-auto w-full flex items-center justify-center">
				<div className="roja_card_wizard w-full relative overflow-hidden p-8 md:p-10 flex flex-col gap-6 items-center text-center">
					{/* Corner gradient glows inside card */}
					<div className="absolute -top-12 -left-12 w-32 h-32 bg-[var(--primary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />
					<div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--secondary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />

					{status === "verifying" && (
						<div className="relative z-10 flex flex-col gap-3 items-center">
							<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
								Memverifikasi Email...
							</div>
							<p className="text-xs text-[var(--body-txt-inverse)] m-0">
								Mohon tunggu, sistem sedang memverifikasi alamat email Anda.
							</p>
						</div>
					)}

					{status === "success" && (
						<div className="relative z-10 flex flex-col gap-4 items-center w-full">
							<div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl font-bold">
								✓
							</div>
							<div className="text-xs font-bold text-[var(--success)] tracking-wide m-0">
								Email Terverifikasi!
							</div>
							<p className="text-xs text-[var(--body-txt-inverse)] m-0">{message}</p>
							<button
								onClick={() => navigate({ to: "/login" })}
								className="roja_btn roja_btn-primary roja_btn-lg w-full text-white bg-[var(--primary)] font-semibold mt-2"
							>
								Masuk Sekarang
							</button>
						</div>
					)}

					{status === "error" && (
						<div className="relative z-10 flex flex-col gap-4 items-center w-full">
							<div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold">
								✕
							</div>
							<div className="text-xs font-bold text-[var(--danger)] tracking-wide m-0">
								Verifikasi Gagal
							</div>
							<p className="text-xs text-red-600 m-0">{message}</p>
							<button
								onClick={() => navigate({ to: "/login" })}
								className="roja_btn roja_btn-secondary roja_btn-lg w-full text-xs font-semibold mt-2"
							>
								Kembali ke Halaman Login
							</button>
						</div>
					)}
				</div>
			</main>
		</div>
	)
}

export const Route = createFileRoute("/email-verify")({
	validateSearch: searchSchema,
	component: EmailVerifyPage,
})

export default EmailVerifyPage
