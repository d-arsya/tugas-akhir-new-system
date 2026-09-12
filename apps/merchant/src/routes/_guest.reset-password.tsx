import { type JSX, useState } from "react"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { toast, ResetPasswordCard, type ResetPasswordSubmitValues } from "@roja/ui"

import { hijackMerchantApi } from "@/lib/dev-hijack"
import { createMerchantApi } from "@roja/api-client"

const merchantApi = hijackMerchantApi(createMerchantApi())

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
				email: search.email || "merchant@pondokroja.ac.id",
				token: search.token || "mock-token",
				password: data.password,
				passwordConfirmation: data.passwordConfirmation,
			})
			toast.success("Password Diperbarui", { description: res.message })
			navigate({ to: "/login" })
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Gagal memperbarui password"
			setErrorMsg(message)
			toast.error("Reset Gagal", { description: message })
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
