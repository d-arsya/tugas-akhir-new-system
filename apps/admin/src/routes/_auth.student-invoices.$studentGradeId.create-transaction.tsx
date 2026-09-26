import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import CreateTransactionPage from "@/components/payments/create-transaction-page"

export const Route = createFileRoute("/_auth/student-invoices/$studentGradeId/create-transaction")({
	validateSearch: (search: Record<string, unknown>): { invoices?: string } =>
		typeof search["invoices"] === "string" ? { invoices: search["invoices"] } : {},
	component: CreateTransactionRoute,
})

function CreateTransactionRoute(): JSX.Element {
	const { studentGradeId } = Route.useParams()
	const { invoices } = Route.useSearch()
	return <CreateTransactionPage studentGradeId={studentGradeId} invoices={invoices} />
}

export default CreateTransactionRoute
