import type { JSX } from "react"
import { useNavigate } from "@tanstack/react-router"
import type { AdminLoginResponse } from "@roja/api-client"
import { GoogleSignInButton, LoginCard, useGoogleClientId, type LoginSubmitValues } from "@roja/ui"
import { toast } from "sonner"

import { useAdminGoogleLoginMutation, useAdminLoginMutation } from "@/hooks/use-admin-queries"
import { sharedApi } from "@/lib/api"

const LoginPage = (): JSX.Element => {
	const navigate = useNavigate()

	const loginMutation = useAdminLoginMutation()
	const googleMutation = useAdminGoogleLoginMutation()
	const googleClientId = useGoogleClientId(sharedApi.getGoogleConfig)

	const handleResult = (res: AdminLoginResponse, fallbackEmail: string): void => {
		if (res.requires2fa) {
			toast.info("Kode 2FA diperlukan untuk memverifikasi akun Anda.")
			navigate({ to: "/verify-2fa", search: { adminId: res.adminId, email: res.email || fallbackEmail } })
			return
		}
		if (res.user) {
			toast.success(`Selamat datang kembali, ${res.user.name || "Admin"}!`)
			navigate({ to: "/dashboard" })
		}
	}

	const handleError = (err: Error): void => {
		toast.error(err.message || "Gagal masuk. Periksa email & kata sandi Anda.")
	}

	const handleSubmit = (values: LoginSubmitValues): void => {
		googleMutation.reset()
		loginMutation.mutate(values, {
			onSuccess: (res, variables) => handleResult(res, variables.identifier),
			onError: handleError,
		})
	}

	const handleGoogle = (credential: string): void => {
		loginMutation.reset()
		googleMutation.mutate(credential, {
			onSuccess: (res) => handleResult(res, ""),
			onError: handleError,
		})
	}

	const error = loginMutation.error ?? googleMutation.error

	return (
		<LoginCard
			title="Admin Panel Login"
			description="Masuk untuk mengelola ekosistem Pondok Pesantren Roja"
			onSubmit={handleSubmit}
			isLoading={loginMutation.isPending || googleMutation.isPending}
			errorMsg={error ? error.message : null}
			forgotPasswordHref="/forgot-password"
			alternativeLogin={
				googleClientId ? (
					<GoogleSignInButton
						clientId={googleClientId}
						onCredential={handleGoogle}
						disabled={googleMutation.isPending}
					/>
				) : undefined
			}
		/>
	)
}

export default LoginPage
