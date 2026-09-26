import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import EwalletHistoryPage from "@/components/ewallet-transactions/history-page"

export const Route = createFileRoute("/_auth/ewallet-transactions/")({
	component: EwalletHistoryRoute,
})

function EwalletHistoryRoute(): JSX.Element {
	return <EwalletHistoryPage />
}

export default EwalletHistoryRoute
