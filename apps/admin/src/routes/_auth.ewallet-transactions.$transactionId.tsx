import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import EwalletHistoryDetailPage from "@/components/ewallet-transactions/history-detail-page"

export const Route = createFileRoute("/_auth/ewallet-transactions/$transactionId")({
	component: EwalletHistoryDetailRoute,
})

function EwalletHistoryDetailRoute(): JSX.Element {
	const { transactionId } = Route.useParams()
	return <EwalletHistoryDetailPage transactionId={Number(transactionId)} />
}

export default EwalletHistoryDetailRoute
