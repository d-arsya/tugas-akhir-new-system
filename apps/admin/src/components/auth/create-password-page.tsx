import { useEffect, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"
import { AuthCard } from "@roja/ui"
import { toast } from "sonner"

import type { AuthUser } from "@roja/types"

import { useCreatePassword, useCreatePasswordCheck } from "@/hooks/use-create-password"
import { legacyErrors } from "@/lib/legacy-errors"
import useAuthStore from "@/stores/auth.store"

import CreatePasswordForm, { type CreatePasswordFormValues } from "./create-password-form"

const TOKEN_ERROR = "Token pengaturan ulang kata sandi tidak sah."

const fieldErrors = (error: unknown): Record<string, string[]> => {
	const raw = (error as { response?: { data?: { errors?: unknown } } })?.response?.data?.errors
	if (!raw || typeof raw !== "object") return {}
	return Object.fromEntries(
		Object.entries(raw as Record<string, unknown>).map(([key, value]) => [
			key,
			(Array.isArray(value) ? value : [value]).filter((entry): entry is string => typeof entry === "string"),
		]),
	)
}

type CreatePasswordPageProps = {
	token: string
	email: string
}

const CreatePasswordPage = ({ token, email }: CreatePasswordPageProps): JSX.Element => {
	const navigate = useNavigate()

	const check = useCreatePasswordCheck(token, email)
	const createPassword = useCreatePassword()

	useEffect(() => {
		const missing = token === "" || email === ""
		if (!missing && !check.isError) return
		toast.error(missing ? TOKEN_ERROR : legacyErrors(check.error, TOKEN_ERROR)[0])
		void navigate({ to: "/forgot-password" })
	}, [token, email, check.isError, check.error, navigate])

	const handleSubmit = (values: CreatePasswordFormValues): void => {
		createPassword.mutate(
			{ token, email, ...values },
			{
				onSuccess: (result) => {
					if (result.user) useAuthStore.getState().login(result.user as AuthUser)
					void navigate({ to: "/dashboard" })
				},
			},
		)
	}

	const errors = fieldErrors(createPassword.error)

	return (
		<AuthCard
			title="Buat password baru"
			description="Anda telah didaftarkan sebagai admin pada sistem kami. Silakan atur password untuk masuk ke aplikasi."
			errorMsg={errors["weakPassword"]?.[0] ?? null}
		>
			{check.data ? (
				<CreatePasswordForm
					email={check.data.email}
					onSubmit={handleSubmit}
					submitting={createPassword.isPending}
					errors={errors}
				/>
			) : null}
		</AuthCard>
	)
}

export default CreatePasswordPage
