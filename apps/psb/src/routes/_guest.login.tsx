import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useState, type JSX } from "react"
import axios from "axios"
import { Button, GoogleSignInButton, LoginCard, useGoogleClientId, type LoginSubmitValues } from "@roja/ui"
import { psbApi, sharedApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"

type PsbLoginResult = Awaited<ReturnType<typeof psbApi.login>>

const LoginPage = (): JSX.Element => {
	const navigate = useNavigate()
	const login = useAuthStore((s) => s.login)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isResending, setIsResending] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [infoMsg, setInfoMsg] = useState<string | null>(null)
	const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

	const googleClientId = useGoogleClientId(sharedApi.getGoogleConfig)

	const signIn = async (request: () => Promise<PsbLoginResult>, email: string | null): Promise<void> => {
		setIsLoading(true)
		setErrorMsg(null)
		setInfoMsg(null)
		setUnverifiedEmail(null)
		try {
			const res = await request()
			if (res.requires2fa) {
				navigate({ to: "/verify-2fa", search: { email: res.email } })
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

			if (isUnverified && email) {
				navigate({ to: "/need-verify", search: { email } })
				return
			}
			setErrorMsg(msg)
		} finally {
			setIsLoading(false)
		}
	}

	const onSubmit = (data: LoginSubmitValues): Promise<void> =>
		signIn(() => psbApi.login({ email: data.identifier, password: data.password }), data.identifier)

	const onGoogle = (credential: string): Promise<void> => signIn(() => psbApi.loginWithGoogle(credential), null)

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
		<LoginCard
			title="Login Member Area"
			description="Masuk untuk memantau status verifikasi pendaftaran dan informasi santri baru."
			identifierPlaceholder="Alamat Email"
			identifierType="email"
			forgotPasswordHref="/forgot-password"
			isLoading={isLoading}
			errorMsg={errorMsg}
			infoMsg={infoMsg}
			alternativeLogin={
				googleClientId ? (
					<GoogleSignInButton clientId={googleClientId} onCredential={onGoogle} disabled={isLoading} />
				) : undefined
			}
			extraAlertContent={
				unverifiedEmail && (
					<Button
						type="button"
						variant="link"
						onClick={handleResendVerification}
						disabled={isResending}
						className="text-[11px] p-0 h-auto font-bold text-[var(--secondary)] text-left"
					>
						{isResending ? "Mengirim email verifikasi..." : "Kirim Ulang Link Verifikasi Email"}
					</Button>
				)
			}
			footer={
				<>
					Belum mendaftar?{" "}
					<Link to="/" className="text-[var(--secondary)] hover:underline font-semibold">
						Mulai Pendaftaran Baru
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
