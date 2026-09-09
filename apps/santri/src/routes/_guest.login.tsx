import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { santriApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import axios from "axios"
import { Button, Input, Label, Alert, AlertDescription, RojaCard } from "@roja/ui"
import { isDevHijackMode, mockSantriAuth } from "@/lib/dev-hijack"

const loginSchema = z.object({
	nis: z.string().min(1, "Nomor Induk Santri wajib diisi"),
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
			nis: "",
			password: "",
		},
	})

	const onSubmit = async (data: LoginInput): Promise<void> => {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			if (isDevHijackMode()) {
				await new Promise((res) => setTimeout(res, 500))
				const mock = mockSantriAuth.login(data.nis)
				if (mock.requires2fa && mock.email) {
					localStorage.setItem("roja-2fa-email", mock.email)
					localStorage.setItem("roja-2fa-student-id", String(mock.studentId))
					navigate({ to: "/verify-2fa" })
					return
				}
				if (mock.user) {
					login(mock.user as any)
					navigate({ to: "/dashboard" })
					return
				}
			}

			const res = await santriApi.login(data)
			if (res.requires2fa && res.email) {
				localStorage.setItem("roja-2fa-email", res.email)
				localStorage.setItem("roja-2fa-student-id", String(res.studentId))
				navigate({ to: "/verify-2fa" })
			} else if (!res.requires2fa && res.user) {
				login(res.user as any)
				navigate({ to: "/dashboard" })
			}
		} catch (err: unknown) {
			let msg = "NIS atau password salah"
			if (axios.isAxiosError(err)) {
				msg = err.response?.data?.message || err.response?.data?.error || err.message || msg
			} else if (err instanceof Error) {
				msg = err.message
			}
			setErrorMsg(msg)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<RojaCard className="flex flex-col gap-6 p-8 md:p-10 w-full max-w-md mx-auto my-8">
			<div className="flex flex-col gap-2 items-center text-center">
				<img src="/assets/svg/etc/Logo.svg" alt="Pondok Roja" className="h-14 w-auto mb-2" />
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Login Santri Area</div>
				<p className="text-xs text-[var(--grey)] m-0">
					Masuk untuk melihat informasi riwayat pembayaran baru & e-wallet.
				</p>
			</div>

			{errorMsg && (
				<Alert variant="destructive" className="flex flex-col gap-2">
					<AlertDescription className="text-xs">{errorMsg}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<Input
						id="nis"
						type="text"
						className="h-11"
						placeholder="Nomor Induk Santri"
						{...register("nis")}
					/>
					{errors.nis && <p className="text-xs text-destructive mt-0.5">{errors.nis.message}</p>}
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

			<div className="text-center text-xs border-t border-[var(--bg-form-border)] pt-4 text-[var(--body-txt-inverse)]">
				Butuh bantuan akun?{" "}
				<Link to="/forgot-password" className="text-[var(--secondary)] hover:underline font-semibold">
					Lupa Password
				</Link>
			</div>
		</RojaCard>
	)
}

export const Route = createFileRoute("/_guest/login")({
	component: LoginPage,
})

export default LoginPage
