import { useState } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { LoginCard, type LoginSubmitValues } from "@roja/ui"
import { toast } from "sonner"

import { merchantApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"

export const Route = createFileRoute("/_guest/login")({
	component: LoginRouteComponent,
})


function LoginRouteComponent(): JSX.Element {
	const navigate = useNavigate()
	const { login } = useAuthStore()
	const [isLoading, setIsLoading] = useState(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const onSubmit = async (data: LoginSubmitValues) => {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			const res = await merchantApi.login({
				uniqueNumber: data.identifier,
				password: data.password,
			})
			if (res.requires2fa) {
				toast.info("Verifikasi 2FA diperlukan", {
					description: "Kode 2FA telah dikirim ke email terdaftar.",
				})
				navigate({
					to: "/verify-2fa",
					search: { merchantId: String(res.merchantId) },
				})
				return
			}

			login(res.user)
			toast.success("Login Berhasil", {
				description: `Selamat datang kembali, ${res.user.name}!`,
			})
			navigate({ to: "/e-wallet" })
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Gagal melakukan login"
			setErrorMsg(message)
			toast.error("Login Gagal", { description: message })
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<LoginCard
			title="Login Merchant Area"
			description="Masuk untuk mengelola transaksi kantin & e-wallet merchant."
			identifierPlaceholder="Nomor Merchant (e.g. MRC-2026-001)"
			showRememberMe
			forgotPasswordHref="/forgot-password"
			isLoading={isLoading}
			errorMsg={errorMsg}
			footer={
				<>
					Butuh bantuan akun?{" "}
					<Link to="/forgot-password" className="text-[#e4007e] hover:underline font-semibold">
						Lupa Password
					</Link>
				</>
			}
			onSubmit={onSubmit}
		/>
	)
}

export default Route
