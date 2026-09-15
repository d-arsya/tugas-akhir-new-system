import type { JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAdminLoginMutation } from "@/hooks/use-admin-queries"
import { LoginCard, type LoginSubmitValues } from "@roja/ui"
import { toast } from "sonner"

export const Route = createFileRoute("/_guest/login")({
	component: LoginPage,
})

function LoginPage(): JSX.Element {
	const navigate = useNavigate()

	const loginMutation = useAdminLoginMutation()

	const handleSubmit = (values: LoginSubmitValues) => {
		loginMutation.mutate(values, {
			onSuccess: (res, variables) => {
				if (res.requires2fa) {
					toast.info("Kode 2FA diperlukan untuk memverifikasi akun Anda.")
					navigate({ to: "/verify-2fa" as any, search: { adminId: res.adminId, email: res.email || variables.identifier } as any })
					return
				}
				if (res.accessToken && res.refreshToken && res.user) {
					toast.success(`Selamat datang kembali, ${res.user.name || "Admin"}!`)
					navigate({ to: "/dashboard" as any })
				}
			},
			onError: (err: any) => {
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
			errorMsg={loginMutation.error ? (loginMutation.error as Error).message : null}
			forgotPasswordHref="/forgot-password"
		/>
	)
}

export default LoginPage
