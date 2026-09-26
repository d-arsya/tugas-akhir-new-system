import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import InvoiceDetailPage from "@/components/student-invoices/invoice-detail-page"

export const Route = createFileRoute("/_auth/student-invoices/$studentGradeId/")({
	component: StudentInvoiceDetailPage,
})

function StudentInvoiceDetailPage(): JSX.Element {
	const { studentGradeId } = Route.useParams()
	return <InvoiceDetailPage studentGradeId={studentGradeId} />
}

export default StudentInvoiceDetailPage
