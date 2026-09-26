import type { JSX } from "react"
import { useNavigate } from "@tanstack/react-router"
import { LoginCard, type LoginSubmitValues } from "@roja/ui"
import { toast } from "sonner"

import { useAdminLoginMutation } from "@/hooks/use-admin-queries"

const LoginPage = (): JSX.Element => {
	const navigate = useNavigate()

	const loginMutation = useAdminLoginMutation()

	const handleSubmit = (values: LoginSubmitValues): void => {
		loginMutation.mutate(values, {
			onSuccess: (res, variables) => {
				if (res.requires2fa) {
					toast.info("Kode 2FA diperlukan untuk memverifikasi akun Anda.")
					navigate({ to: "/verify-2fa", search: { adminId: res.adminId, email: res.email || variables.identifier } })
					return
				}
				if (!res.requires2fa && res.user) {
					toast.success(`Selamat datang kembali, ${res.user.name || "Admin"}!`)
					navigate({ to: "/dashboard" })
				}
			},
			onError: (err) => {
				toast.error(err.message || "Gagal masuk. Periksa email & kata sandi Anda.")
			},
		})
	}

	return (
		<LoginCard
			title="Admin Panel Login"
			description="Masuk untuk mengelola ekosistem Pondok Pesantren Roja"
			onSubmit={handleSubmit}
			isLoading={loginMutation.isPending}
			errorMsg={loginMutation.error ? loginMutation.error.message : null}
			forgotPasswordHref="/forgot-password"
		/>
	)
}

export default LoginPage
