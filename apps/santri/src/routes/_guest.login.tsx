import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useState } from "react"
import axios from "axios"
import { LoginCard, type LoginSubmitValues } from "@roja/ui"
import { santriApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"
import { isDevHijackMode, mockSantriAuth } from "@/lib/dev-hijack"

const LoginPage = (): JSX.Element => {
	const navigate = useNavigate()
	const login = useAuthStore((s) => s.login)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const onSubmit = async (data: LoginSubmitValues): Promise<void> => {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			if (isDevHijackMode()) {
				await new Promise((res) => setTimeout(res, 500))
				const mock = mockSantriAuth.login(data.identifier)
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

			const res = await santriApi.login({ nis: data.identifier, password: data.password })
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
		<LoginCard
			title="Login Santri Area"
			description="Masuk untuk melihat informasi riwayat pembayaran baru & e-wallet."
			identifierPlaceholder="Nomor Induk Santri"
			forgotPasswordHref="/forgot-password"
			isLoading={isLoading}
			errorMsg={errorMsg}
			footer={
				<>
					Butuh bantuan akun?{" "}
					<Link to="/forgot-password" className="text-[var(--secondary)] hover:underline font-semibold">
						Lupa Password
					</Link>
				</>
			}
			onSubmit={onSubmit}
		/>
	)
}

export const Route = createFileRoute("/_guest/login")({
	component: LoginPage,
})

export default LoginPage
