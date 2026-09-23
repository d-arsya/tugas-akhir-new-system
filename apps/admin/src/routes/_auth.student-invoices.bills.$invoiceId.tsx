import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import InvoiceBillCard from "@/components/student-invoices/invoice-bill-card"
import InvoiceNoteForm from "@/components/student-invoices/invoice-note-form"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import { useInvoiceBill } from "@/hooks/use-student-invoices"

// Legacy student-invoice/detail-bill.blade.php — one invoice and the payments against it.
// Its header is the 4-level shape: a dots dropdown, then two links, then the leaf.
export const Route = createFileRoute("/_auth/student-invoices/bills/$invoiceId")({
	component: InvoiceBillPage,
})

function InvoiceBillPage(): JSX.Element {
	const { invoiceId } = Route.useParams()
	const bill = useInvoiceBill(Number(invoiceId))

	return (
		<>
			<AdminPageTitle
				title="Detail Tagihan"
				breadcrumbs={[
					{ label: "Pembayaran Santri", dropdown: [{ label: "Pembayaran Santri", to: "/student-invoices" }] },
					{ label: "Tagihan", to: "/student-invoices" },
					{ label: "Detail" },
					{ label: "Detail Tagihan" },
				]}
			/>

			{bill.data ? (
				<div className="mx-[-15px] flex flex-wrap">
					<div className="w-full px-[15px] min-[992px]:w-1/4">
						<LegacyStudentCard student={bill.data.student} className="mb-[24px]" />
					</div>
					<div className="w-full px-[15px] min-[992px]:w-3/4">
						<InvoiceBillCard bill={bill.data} />
						<InvoiceNoteForm
							invoiceId={bill.data.id}
							studentGradeId={bill.data.student.studentGradeId}
							note={bill.data.note}
						/>
					</div>
				</div>
			) : null}
		</>
	)
}

export default InvoiceBillPage
