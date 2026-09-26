import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import TransactionDetailPage from "@/components/student-transactions/transaction-detail-page"

export const Route = createFileRoute("/_auth/student-transactions/$transactionId")({
	component: StudentTransactionDetailPage,
})

function StudentTransactionDetailPage(): JSX.Element {
	const { transactionId } = Route.useParams()
	return <TransactionDetailPage transactionId={Number(transactionId)} />
}

export default StudentTransactionDetailPage
