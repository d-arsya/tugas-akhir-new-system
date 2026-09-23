import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { ForgotPasswordCard } from "@roja/ui"
import { santriApi } from "@/lib/api"

const ForgotPasswordPage = (): JSX.Element => {
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isSubmitSuccessful, setIsSubmitSuccessful] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const onSubmit = async (email: string): Promise<void> => {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			const res = await santriApi.forgotPassword({ email })
			setSuccessMsg(res.message || "Instruksi reset password telah dikirim ke email Anda.")
			setIsSubmitSuccessful(true)
			setTimeout(() => {
				navigate({ to: "/login" })
			}, 3000)
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<ForgotPasswordCard
			title="Lupa Password"
			description="Masukkan email terdaftar Anda untuk menerima link reset password."
			emailPlaceholder="Email"
			isLoading={isLoading}
			isSubmitSuccessful={isSubmitSuccessful}
			successMsg={successMsg}
			errorMsg={errorMsg}
			onSubmit={onSubmit}
		/>
	)
}

export const Route = createFileRoute("/_guest/forgot-password")({
	component: ForgotPasswordPage,
})

export default ForgotPasswordPage
