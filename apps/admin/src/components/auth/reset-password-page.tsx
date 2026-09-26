import type { JSX } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ResetPasswordCard, type ResetPasswordSubmitValues } from "@roja/ui"
import { toast } from "sonner"

import { useAdminResetPasswordMutation } from "@/hooks/use-admin-queries"

type ResetPasswordPageProps = {
	token: string
}

const ResetPasswordPage = ({ token }: ResetPasswordPageProps): JSX.Element => {
	const navigate = useNavigate()

	const resetMutation = useAdminResetPasswordMutation(token)

	const handleSubmit = (values: ResetPasswordSubmitValues): void => {
		resetMutation.mutate(values, {
			onSuccess: (res) => {
				toast.success(res.message || "Password berhasil diperbarui.")
				navigate({ to: "/login" })
			},
			onError: (err) => {
				toast.error(err.message || "Gagal memperbarui password.")
			},
		})
	}

	return (
		<ResetPasswordCard
			onSubmit={handleSubmit}
			isLoading={resetMutation.isPending}
			errorMsg={resetMutation.error ? resetMutation.error.message : null}
			loginHref="/login"
		/>
	)
}

export default ResetPasswordPage
