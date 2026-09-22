import type { JSX } from "react"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { useAdminVerify2faMutation, useAdminResend2faMutation } from "@/hooks/use-admin-queries"
import { TwoFactorCard } from "@roja/ui"
import { toast } from "sonner"

export const Route = createFileRoute("/_guest/verify-2fa")({
	component: Verify2faPage,
})

function Verify2faPage(): JSX.Element {
	const navigate = useNavigate()
	const search = useSearch({ strict: false }) as { adminId?: number; email?: string }

	const adminId = Number(search.adminId) || 1

	const verifyMutation = useAdminVerify2faMutation()
	const resendMutation = useAdminResend2faMutation()

	const handleVerify = (code: string) => {
		verifyMutation.mutate(
			{ code, adminId },
			{
				onSuccess: (res) => {
					if (res.user) {
						toast.success("Verifikasi 2FA berhasil!")
						navigate({ to: "/dashboard" as any })
					}
				},
				onError: (err: any) => {
					toast.error(err.message || "Kode 2FA tidak valid.")
				},
			},
		)
	}

	const handleResend = () => {
		resendMutation.mutate(adminId, {
			onSuccess: (res) => {
				toast.success(res.message || "Kode 2FA baru telah dikirim.")
			},
			onError: (err: any) => {
				toast.error(err.message || "Gagal mengirim ulang kode 2FA.")
			},
		})
	}

	return (
		<TwoFactorCard
			email={search.email || "admin@pondokroja.ac.id"}
			onSubmit={handleVerify}
			onResend={handleResend}
			isLoading={verifyMutation.isPending}
			isResending={resendMutation.isPending}
			errorMsg={verifyMutation.error ? (verifyMutation.error as Error).message : null}
		/>
	)
}

export default Verify2faPage
