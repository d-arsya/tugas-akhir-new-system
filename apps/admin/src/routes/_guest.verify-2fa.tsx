import type { JSX } from "react"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"
import { TwoFactorCard } from "@roja/ui"
import { toast } from "sonner"

export const Route = createFileRoute("/_guest/verify-2fa")({
	component: Verify2faPage,
})

function Verify2faPage(): JSX.Element {
	const navigate = useNavigate()
	const search = useSearch({ strict: false }) as { adminId?: number; email?: string }
	const auth = useAuthStore()

	const adminId = Number(search.adminId) || 1

	const verifyMutation = useMutation({
		mutationFn: async (code: string) => adminApi.verify2fa(code, adminId),
		onSuccess: (res) => {
			if (res.accessToken && res.refreshToken && res.user) {
				auth.login(res.accessToken, res.refreshToken, res.user)
				toast.success("Verifikasi 2FA berhasil!")
				navigate({ to: "/dashboard" as any })
			}
		},
		onError: (err: any) => {
			toast.error(err.message || "Kode 2FA tidak valid.")
		},
	})

	const resendMutation = useMutation({
		mutationFn: async () => adminApi.resend2fa(adminId),
		onSuccess: (res) => {
			toast.success(res.message || "Kode 2FA baru telah dikirim.")
		},
	})

	return (
		<TwoFactorCard
			email={search.email || "admin@pondokroja.ac.id"}
			onSubmit={(code) => verifyMutation.mutate(code)}
			onResend={() => resendMutation.mutate()}
			isLoading={verifyMutation.isPending}
			isResending={resendMutation.isPending}
			errorMsg={verifyMutation.error ? (verifyMutation.error as Error).message : null}
		/>
	)
}

export default Verify2faPage
