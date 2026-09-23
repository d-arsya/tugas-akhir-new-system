import type { JSX } from "react"
import { useNavigate, createFileRoute, useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { ResetPasswordCard, type ResetPasswordSubmitValues } from "@roja/ui"
import { santriApi } from "@/lib/api"

type ResetPasswordSearch = {
	token?: string
	email?: string
}

const ResetPasswordPage = (): JSX.Element => {
	const navigate = useNavigate()
	const search = useSearch({ from: "/_guest/reset-password" }) as ResetPasswordSearch
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const onSubmit = async (data: ResetPasswordSubmitValues): Promise<void> => {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			const res = await santriApi.resetPassword({
				email: search.email || "",
				token: search.token || "",
				password: data.password,
				passwordConfirmation: data.passwordConfirmation,
			})
			setSuccessMsg(res.message || "Password Anda berhasil diperbarui.")
			setTimeout(() => {
				navigate({ to: "/login" })
			}, 2000)
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<ResetPasswordCard
			title="Atur Ulang Password"
			description="Masukkan password baru Anda di bawah ini."
			submitLabel="Simpan Password"
			isLoading={isLoading}
			successMsg={successMsg}
			errorMsg={errorMsg}
			onSubmit={onSubmit}
		/>
	)
}

export const Route = createFileRoute("/_guest/reset-password")({
	validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => {
		return {
			token: typeof search.token === "string" ? search.token : undefined,
			email: typeof search.email === "string" ? search.email : undefined,
		}
	},
	component: ResetPasswordPage,
})

export default ResetPasswordPage
