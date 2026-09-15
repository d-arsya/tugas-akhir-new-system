import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useAdminForgotPasswordMutation } from "@/hooks/use-admin-queries"
import { ForgotPasswordCard } from "@roja/ui"
import { toast } from "sonner"

export const Route = createFileRoute("/_guest/forgot-password")({
	component: ForgotPasswordPage,
})

function ForgotPasswordPage(): JSX.Element {
	const forgotMutation = useAdminForgotPasswordMutation()

	const handleSubmit = (email: string) => {
		forgotMutation.mutate(email, {
			onSuccess: (res) => {
				toast.success(res.message || "Tautan pemulihan kata sandi telah dikirim.")
			},
			onError: (err: any) => {
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
			errorMsg={forgotMutation.error ? (forgotMutation.error as Error).message : null}
			loginHref="/login"
		/>
	)
}

export default ForgotPasswordPage
