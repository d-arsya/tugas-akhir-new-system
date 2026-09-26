import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import { useInvoiceBill } from "@/hooks/use-student-invoices"

import InvoiceBillCard from "./invoice-bill-card"
import InvoiceNoteForm from "./invoice-note-form"

const InvoiceBillPage = ({ invoiceId }: { invoiceId: number }): JSX.Element => {
	const bill = useInvoiceBill(invoiceId)

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
