import type { JSX } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_member/dashboard")({
	beforeLoad: () => {
		throw redirect({ to: "/payment-history" })
	},
	component: (): JSX.Element | null => null,
})

export default Route
