import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import TransactionListPage from "@/components/student-transactions/transaction-list-page"

export const Route = createFileRoute("/_auth/student-transactions/")({
	component: StudentTransactionIndexPage,
})

function StudentTransactionIndexPage(): JSX.Element {
	return <TransactionListPage />
}

export default StudentTransactionIndexPage
