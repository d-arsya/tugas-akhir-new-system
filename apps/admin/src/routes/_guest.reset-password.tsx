import type { JSX } from "react"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { useAdminResetPasswordMutation } from "@/hooks/use-admin-queries"
import { ResetPasswordCard, type ResetPasswordSubmitValues } from "@roja/ui"
import { toast } from "sonner"

export const Route = createFileRoute("/_guest/reset-password")({
	component: ResetPasswordPage,
})

function ResetPasswordPage(): JSX.Element {
	const navigate = useNavigate()
	const search = useSearch({ strict: false }) as { token?: string }

	const token = search.token || ""

	const resetMutation = useAdminResetPasswordMutation(token)

	const handleSubmit = (values: ResetPasswordSubmitValues) => {
		resetMutation.mutate(values, {
			onSuccess: (res) => {
				toast.success(res.message || "Password berhasil diperbarui.")
				navigate({ to: "/login" as any })
			},
			onError: (err: any) => {
				toast.error(err.message || "Gagal memperbarui password.")
			},
		})
	}

	return (
		<ResetPasswordCard
			onSubmit={handleSubmit}
			isLoading={resetMutation.isPending}
			errorMsg={resetMutation.error ? (resetMutation.error as Error).message : null}
			loginHref="/login"
		/>
	)
}

export default ResetPasswordPage
