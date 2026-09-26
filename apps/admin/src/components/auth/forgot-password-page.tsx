import type { JSX } from "react"
import { ForgotPasswordCard } from "@roja/ui"
import { toast } from "sonner"

import { useAdminForgotPasswordMutation } from "@/hooks/use-admin-queries"

const ForgotPasswordPage = (): JSX.Element => {
	const forgotMutation = useAdminForgotPasswordMutation()

	const handleSubmit = (email: string): void => {
		forgotMutation.mutate(email, {
			onSuccess: (res) => {
				toast.success(res.message || "Tautan pemulihan kata sandi telah dikirim.")
			},
			onError: (err) => {
				toast.error(err.message || "Gagal mengirim email pemulihan.")
			},
		})
	}

	return (
		<ForgotPasswordCard
			onSubmit={handleSubmit}
			isLoading={forgotMutation.isPending}
			isSubmitSuccessful={forgotMutation.isSuccess}
			successMsg={forgotMutation.isSuccess ? "Silakan periksa kotak masuk email Anda untuk instruksi selanjutnya." : null}
			errorMsg={forgotMutation.error ? forgotMutation.error.message : null}
			loginHref="/login"
		/>
	)
}

export default ForgotPasswordPage
