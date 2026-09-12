import { type JSX, useState } from "react"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { ResetPasswordCard, type ResetPasswordSubmitValues } from "@roja/ui"
import { toast } from "sonner"

import { merchantApi } from "@/lib/api"

type ResetPasswordSearch = {

	email?: string
	token?: string
}

export const Route = createFileRoute("/_guest/reset-password")({
	validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
		email: typeof search.email === "string" ? search.email : undefined,
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	component: ResetPasswordRouteComponent,
})

function ResetPasswordRouteComponent(): JSX.Element {
	const navigate = useNavigate()
	const search = useSearch({ from: "/_guest/reset-password" })
	const [isLoading, setIsLoading] = useState(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const onSubmit = async (data: ResetPasswordSubmitValues) => {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			const res = await merchantApi.resetPassword({
				email: search.email || "",
				token: search.token || "",
				password: data.password,
				passwordConfirmation: data.passwordConfirmation,
			})
			toast.success("Password Berhasil Diperbarui", { description: res.message || "Silakan login menggunakan password baru Anda." })
			navigate({ to: "/login" })
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Gagal memperbarui password"
			setErrorMsg(message)
			toast.error("Gagal Reset Password", { description: message })
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<ResetPasswordCard
			title="Reset Password"
			description="Buat password baru yang aman untuk akun merchant Anda."
			isLoading={isLoading}
			errorMsg={errorMsg}
			onSubmit={onSubmit}
		/>
	)
}

export default Route
