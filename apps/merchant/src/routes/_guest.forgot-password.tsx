import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ForgotPasswordCard } from "@roja/ui"
import { toast } from "sonner"

import { merchantApi } from "@/lib/api"

export const Route = createFileRoute("/_guest/forgot-password")({
	component: ForgotPasswordRouteComponent,
})


function ForgotPasswordRouteComponent(): JSX.Element {
	const [isLoading, setIsLoading] = useState(false)
	const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const onSubmit = async (email: string) => {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			const res = await merchantApi.forgotPassword({ email })
			toast.success("Permintaan Diterima", { description: res.message })
			setIsSubmitSuccessful(true)
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Gagal mengirim email reset password"
			setErrorMsg(message)
			toast.error("Gagal Mengirim", { description: message })
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<ForgotPasswordCard
			title="Lupa Password"
			description="Masukkan alamat email terdaftar Anda untuk menerima link reset password."
			isLoading={isLoading}
			isSubmitSuccessful={isSubmitSuccessful}
			errorMsg={errorMsg}
			onSubmit={onSubmit}
		/>
	)
}

export default Route
