import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import PaymentDetailPage from "@/components/payments/payment-detail-page"

export const Route = createFileRoute("/_auth/student-invoices/transactions/$transactionId")({
	validateSearch: (search: Record<string, unknown>): { download?: string } =>
		typeof search["download"] === "string" ? { download: search["download"] } : {},
	component: InvoicePaymentPage,
})

function InvoicePaymentPage(): JSX.Element {
	const { transactionId } = Route.useParams()
	const { download } = Route.useSearch()
	return <PaymentDetailPage transactionId={Number(transactionId)} download={download} />
}

export default InvoicePaymentPage
