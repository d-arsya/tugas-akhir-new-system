import type { JSX } from "react"
import { createFileRoute, useSearch } from "@tanstack/react-router"
import Verify2faPage from "@/components/auth/verify-2fa-page"

export const Route = createFileRoute("/_guest/verify-2fa")({
	component: Verify2faRoute,
})

function Verify2faRoute(): JSX.Element {
	const search = useSearch({ strict: false }) as { adminId?: number; email?: string }
	return <Verify2faPage adminId={Number(search.adminId) || 1} email={search.email || "admin@pondokroja.ac.id"} />
}
