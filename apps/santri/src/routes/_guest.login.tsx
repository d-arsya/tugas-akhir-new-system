import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useState, type JSX } from "react"
import axios from "axios"
import { GoogleSignInButton, LoginCard, useGoogleClientId, type LoginSubmitValues } from "@roja/ui"
import { toast } from "sonner"
import { santriApi, sharedApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"

type SantriLoginResult = Awaited<ReturnType<typeof santriApi.login>>

const LoginPage = (): JSX.Element => {
	const navigate = useNavigate()
	const login = useAuthStore((s) => s.login)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const googleClientId = useGoogleClientId(sharedApi.getGoogleConfig)

	const signIn = async (request: () => Promise<SantriLoginResult>): Promise<void> => {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			const res = await request()
			if (res.requires2fa && res.email) {
				toast.info("Verifikasi 2FA Diperlukan", { description: "Kode 2FA telah dikirim ke email terdaftar." })
				navigate({ to: "/verify-2fa", search: { studentId: res.studentId, email: res.email } })
			} else if (!res.requires2fa && res.user) {
				login(res.user as any)
				toast.success("Login Berhasil", { description: `Selamat datang kembali, ${res.user.name}!` })
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
			toast.error("Login Gagal", { description: msg })
		} finally {
			setIsLoading(false)
		}
	}

	const onSubmit = (data: LoginSubmitValues): Promise<void> =>
		signIn(() => santriApi.login({ nis: data.identifier, password: data.password }))

	const onGoogle = (credential: string): Promise<void> => signIn(() => santriApi.loginWithGoogle(credential))

	return (
		<LoginCard
			title="Login Santri Area"
			description="Masuk untuk melihat informasi riwayat pembayaran baru & e-wallet."
			identifierPlaceholder="Nomor Induk Santri"
			forgotPasswordHref="/forgot-password"
			isLoading={isLoading}
			errorMsg={errorMsg}
			alternativeLogin={
				googleClientId ? (
					<GoogleSignInButton clientId={googleClientId} onCredential={onGoogle} disabled={isLoading} />
				) : undefined
			}
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
