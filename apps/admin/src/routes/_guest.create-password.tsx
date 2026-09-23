import { useEffect, type JSX } from "react"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { AuthCard } from "@roja/ui"
import { toast } from "sonner"

import type { AuthUser, CreatePasswordPayload } from "@roja/types"

import CreatePasswordForm from "@/components/auth/create-password-form"
import { useCreatePassword, useCreatePasswordCheck } from "@/hooks/use-create-password"
import { legacyErrors } from "@/lib/legacy-errors"
import useAuthStore from "@/stores/auth.store"

// WS-A: legacy auth/passwords/create.blade.php — opened from the "Buat Password" email
export const Route = createFileRoute("/_guest/create-password")({
	component: CreatePasswordPage,
})

// `resources/lang/id/passwords.php` → `passwords.token`
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

function CreatePasswordPage(): JSX.Element {
	const navigate = useNavigate()
	const search = useSearch({ strict: false }) as { token?: string; email?: string }
	const token = search.token ?? ""
	const email = search.email ?? ""

	const check = useCreatePasswordCheck(token, email)
	const createPassword = useCreatePassword()

	// `showCreateForm()` sends a missing or invalid token back to the "lupa password" page
	useEffect(() => {
		const missing = token === "" || email === ""
		if (!missing && !check.isError) return
		toast.error(missing ? TOKEN_ERROR : legacyErrors(check.error, TOKEN_ERROR)[0])
		void navigate({ to: "/forgot-password" })
	}, [token, email, check.isError, check.error, navigate])

	const handleSubmit = (values: Pick<CreatePasswordPayload, "password" | "passwordConfirmation" | "weakPassword">): void => {
		createPassword.mutate(
			{ token, email, ...values },
			{
				onSuccess: (result) => {
					// The response matches `login`, so the session lands in the store the same way
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
			// The blade shows the weak-password message as an alert above the form
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
