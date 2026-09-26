import type { JSX } from "react"
import { createFileRoute, useSearch } from "@tanstack/react-router"
import CreatePasswordPage from "@/components/auth/create-password-page"

export const Route = createFileRoute("/_guest/create-password")({
	component: CreatePasswordRoute,
})

function CreatePasswordRoute(): JSX.Element {
	const search = useSearch({ strict: false }) as { token?: string; email?: string }
	return <CreatePasswordPage token={search.token ?? ""} email={search.email ?? ""} />
}
