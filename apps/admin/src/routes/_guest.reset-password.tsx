import type { JSX } from "react"
import { createFileRoute, useSearch } from "@tanstack/react-router"
import ResetPasswordPage from "@/components/auth/reset-password-page"

export const Route = createFileRoute("/_guest/reset-password")({
	component: ResetPasswordRoute,
})

function ResetPasswordRoute(): JSX.Element {
	const search = useSearch({ strict: false }) as { token?: string }
	return <ResetPasswordPage token={search.token || ""} />
}
