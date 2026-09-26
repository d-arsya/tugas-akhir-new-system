import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import EwalletTransactionDetailPage from "@/components/ewallet-transactions/transaction-detail-page"

export const Route = createFileRoute("/_auth/ewallets/transactions/$transactionId")({
	component: EwalletTransactionDetailRoute,
})

function EwalletTransactionDetailRoute(): JSX.Element {
	const { transactionId } = Route.useParams()
	return <EwalletTransactionDetailPage transactionId={Number(transactionId)} />
}

export default EwalletTransactionDetailRoute
