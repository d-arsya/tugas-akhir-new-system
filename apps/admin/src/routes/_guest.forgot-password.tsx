import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { ForgotPasswordCard } from "@roja/ui"
import { toast } from "sonner"

export const Route = createFileRoute("/_guest/forgot-password")({
	component: ForgotPasswordPage,
})

function ForgotPasswordPage(): JSX.Element {
	const forgotMutation = useMutation({
		mutationFn: async (email: string) => adminApi.forgotPassword(email),
		onSuccess: (res) => {
			toast.success(res.message || "Tautan pemulihan kata sandi telah dikirim.")
		},
		onError: (err: any) => {
			toast.error(err.message || "Gagal mengirim email pemulihan.")
		},
	})

	return (
		<ForgotPasswordCard
			onSubmit={(email) => forgotMutation.mutate(email)}
			isLoading={forgotMutation.isPending}
			isSubmitSuccessful={forgotMutation.isSuccess}
			successMsg={forgotMutation.isSuccess ? "Silakan periksa kotak masuk email Anda untuk instruksi selanjutnya." : null}
			errorMsg={forgotMutation.error ? (forgotMutation.error as Error).message : null}
			loginHref="/login"
		/>
	)
}

export default ForgotPasswordPage
