import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import InvoiceBillPage from "@/components/student-invoices/invoice-bill-page"

export const Route = createFileRoute("/_auth/student-invoices/bills/$invoiceId")({
	component: InvoiceBillRoute,
})

function InvoiceBillRoute(): JSX.Element {
	const { invoiceId } = Route.useParams()
	return <InvoiceBillPage invoiceId={Number(invoiceId)} />
}

export default InvoiceBillRoute
