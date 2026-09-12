import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import axios from "axios"
import { Button, Input, AuthCard, Alert, AlertDescription } from "@roja/ui"

const loginSchema = z.object({
	email: z.string().email("Email tidak valid"),
	password: z.string().min(1, "Password wajib diisi"),
})

type LoginInput = z.infer<typeof loginSchema>

const LoginPage = (): JSX.Element => {
	const navigate = useNavigate()
	const login = useAuthStore((s) => s.login)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isResending, setIsResending] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [infoMsg, setInfoMsg] = useState<string | null>(null)
	const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

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
		setInfoMsg(null)
		setUnverifiedEmail(null)
		try {
			const res = await psbApi.login(data)
			if (res.requires2fa) {
				localStorage.setItem("roja-2fa-email", res.email)
				navigate({ to: "/verify-2fa" })
			} else {
				login(res.user)
				navigate({ to: "/dashboard" })
			}
		} catch (err: unknown) {
			let msg = "Email atau password salah"
			if (axios.isAxiosError(err)) {
				msg = err.response?.data?.message || err.response?.data?.error || err.message || msg
			} else if (err instanceof Error) {
				msg = err.message
			}

			const is403 = axios.isAxiosError(err) && err.response?.status === 403
			const isUnverified =
				is403 ||
				msg.toLowerCase().includes("verifikasi") ||
				msg.toLowerCase().includes("verified")

			if (isUnverified) {
				navigate({ to: "/need-verify", search: { email: data.email } })
				return
			}
			setErrorMsg(msg)
		} finally {
			setIsLoading(false)
		}
	}

	const handleResendVerification = async (): Promise<void> => {
		if (!unverifiedEmail) return
		setIsResending(true)
		setErrorMsg(null)
		setInfoMsg(null)
		try {
			const res = await psbApi.resendVerification(unverifiedEmail)
			setInfoMsg(res.message || `Email verifikasi telah dikirimkan ulang ke ${unverifiedEmail}. Silakan cek kotak masuk email Anda.`)
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal mengirimkan email verifikasi")
		} finally {
			setIsResending(false)
		}
	}

	return (
		<AuthCard
			title="Login Member Area"
			description="Masuk untuk memantau status verifikasi pendaftaran dan informasi santri baru."
			infoMsg={infoMsg}
			footer={
				<>
					Belum mendaftar?{" "}
					<Link to="/" className="text-[var(--secondary)] hover:underline font-semibold">
						Mulai Pendaftaran Baru
					</Link>
				</>
			}
		>
			{errorMsg && (
				<Alert variant="destructive" className="flex flex-col gap-2">
					<AlertDescription className="text-xs">{errorMsg}</AlertDescription>
					{unverifiedEmail && (
						<Button
							type="button"
							variant="link"
							onClick={handleResendVerification}
							disabled={isResending}
							className="text-[11px] p-0 h-auto font-bold text-[var(--secondary)] text-left"
						>
							{isResending ? "Mengirim email verifikasi..." : "Kirim Ulang Link Verifikasi Email"}
						</Button>
					)}
				</Alert>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<Input
						id="email"
						type="email"
						className="h-11"
						placeholder="Alamat Email"
						{...register("email")}
					/>
					{errors.email && <p className="text-xs text-destructive mt-0.5">{errors.email.message}</p>}
				</div>

				<div className="flex flex-col gap-1.5">
					<Input
						id="password"
						type="password"
						className="h-11"
						placeholder="Password"
						{...register("password")}
					/>
					<div className="flex justify-end">
						<Link
							to="/forgot-password"
							className="text-[11px] text-[var(--secondary)] hover:underline font-medium"
						>
							Lupa Password?
						</Link>
					</div>
					{errors.password && <p className="text-xs text-destructive mt-0.5">{errors.password.message}</p>}
				</div>

				<Button
					type="submit"
					variant="roja-primary"
					size="lg"
					className="w-full mt-2"
					disabled={isLoading}
				>
					{isLoading ? "Memproses..." : "Masuk"}
				</Button>
			</form>
		</AuthCard>
	)
}

export const Route = createFileRoute("/_guest/login")({
	component: LoginPage,
})

export default LoginPage
