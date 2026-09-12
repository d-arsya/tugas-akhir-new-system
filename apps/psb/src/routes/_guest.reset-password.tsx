import type { JSX } from "react"
import { useNavigate, createFileRoute, useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { ResetPasswordCard, type ResetPasswordSubmitValues } from "@roja/ui"
import { psbApi } from "@/lib/api"

const searchSchema = z.object({
	token: z.string().optional(),
	email: z.string().optional(),
})

const ResetPasswordPage = (): JSX.Element => {
	const navigate = useNavigate()
	const search = useSearch({ from: "/_guest/reset-password" }) as { token?: string; email?: string }
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const onSubmit = async (data: ResetPasswordSubmitValues): Promise<void> => {
		const token = search?.token
		const email = search?.email
		if (!token) {
			setErrorMsg("Token reset password tidak ditemukan.")
			return
		}
		if (!email) {
			setErrorMsg("Email tidak ditemukan.")
			return
		}

		setIsLoading(true)
		setErrorMsg(null)
		try {
			await psbApi.resetPassword({
				token,
				password: data.password,
				passwordConfirmation: data.passwordConfirmation,
				email,
			})
			setSuccessMsg("Password Anda berhasil diperbarui.")
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
	validateSearch: searchSchema,
	component: ResetPasswordPage,
})

export default ResetPasswordPage
