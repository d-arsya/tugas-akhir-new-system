import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

const loginSchema = z.object({
	email: z.string().email("Email tidak valid"),
	password: z.string().min(1, "Password wajib diisi"),
})

type LoginInput = z.infer<typeof loginSchema>

const LoginPage = (): JSX.Element => {
	const navigate = useNavigate()
	const login = useAuthStore((s) => s.login)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	const onSubmit = async (data: LoginInput): Promise<void> => {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			const res = await psbApi.login(data)
			const profile = await psbApi.getProfile()
			if (profile?.enabled2fa) {
				navigate({ to: "/verify-2fa" })
			} else {
				login(res.tokens.accessToken, res.tokens.refreshToken, res.user)
				navigate({ to: "/dashboard" })
			}
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Email atau password salah")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="max-w-md mx-auto my-8">
			<div className="roja_card_wizard flex flex-col gap-6 p-8 md:p-10 relative overflow-hidden">
				{/* Corner gradient glows inside card */}
				<div className="absolute -top-12 -left-12 w-32 h-32 bg-[var(--primary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />
				<div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--secondary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />

				<div className="relative z-10 flex flex-col gap-2 items-center text-center">
					<img src="/assets/svg/etc/Logo.svg" alt="Pondok Roja" className="h-14 w-auto mb-2" />
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Login Member Area</div>
					<p className="text-xs text-[var(--grey)] m-0">
						Masuk untuk memantau status verifikasi pendaftaran dan informasi santri baru.
					</p>
				</div>

				{errorMsg && (
					<div className="alert roja_alert-danger text-xs py-2.5 px-3 border border-[var(--danger)] rounded-lg">
						{errorMsg}
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<div className="form-group mb-3">
						<label className="control-label">Alamat Email</label>
						<input
							type="email"
							className={`form-control roja_form_control-lg ${errors.email ? "is-invalid" : ""}`}
							placeholder="nama@email.com"
							{...register("email")}
						/>
						{errors.email && <span className="invalid-feedback">{errors.email.message}</span>}
					</div>

					<div className="form-group mb-5">
						<div className="flex items-center justify-between mb-1.5">
							<label className="control-label mb-0">Password</label>
							<Link
								to="/forgot-password"
								className="text-[11px] text-[var(--secondary)] hover:underline font-medium"
							>
								Lupa Password?
							</Link>
						</div>
						<input
							type="password"
							className={`form-control roja_form_control-lg ${errors.password ? "is-invalid" : ""}`}
							placeholder="Masukkan password"
							{...register("password")}
						/>
						{errors.password && <span className="invalid-feedback">{errors.password.message}</span>}
					</div>

					<button
						type="submit"
						className="roja_btn roja_btn-primary roja_btn-lg w-full text-white font-semibold"
						disabled={isLoading}
					>
						{isLoading ? "Memproses..." : "Masuk"}
					</button>
				</form>

				<div className="text-center text-xs border-t border-[var(--bg-form-border)] pt-4 text-[var(--body-txt-inverse)]">
					Belum mendaftar?{" "}
					<Link to="/" className="text-[var(--secondary)] hover:underline font-semibold">
						Mulai Pendaftaran Baru
					</Link>
				</div>
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_guest/login")({
	component: LoginPage,
})

export default LoginPage
