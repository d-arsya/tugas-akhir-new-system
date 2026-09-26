import type { JSX } from "react"
import { useNavigate } from "@tanstack/react-router"
import { TwoFactorCard } from "@roja/ui"
import { toast } from "sonner"

import { useAdminResend2faMutation, useAdminVerify2faMutation } from "@/hooks/use-admin-queries"

type Verify2faPageProps = {
	adminId: number
	email: string
}

const Verify2faPage = ({ adminId, email }: Verify2faPageProps): JSX.Element => {
	const navigate = useNavigate()

	const verifyMutation = useAdminVerify2faMutation()
	const resendMutation = useAdminResend2faMutation()

	const handleVerify = (code: string): void => {
		verifyMutation.mutate(
			{ code, adminId },
			{
				onSuccess: (res) => {
					if (res.user) {
						toast.success("Verifikasi 2FA berhasil!")
						navigate({ to: "/dashboard" })
					}
				},
				onError: (err) => {
					toast.error(err.message || "Kode 2FA tidak valid.")
				},
			},
		)
	}

	const handleResend = (): void => {
		resendMutation.mutate(adminId, {
			onSuccess: (res) => {
				toast.success(res.message || "Kode 2FA baru telah dikirim.")
			},
			onError: (err) => {
				toast.error(err.message || "Gagal mengirim ulang kode 2FA.")
			},
		})
	}

	return (
		<TwoFactorCard
			email={email}
			onSubmit={handleVerify}
			onResend={handleResend}
			isLoading={verifyMutation.isPending}
			isResending={resendMutation.isPending}
			errorMsg={verifyMutation.error ? verifyMutation.error.message : null}
		/>
	)
}

export default Verify2faPage
