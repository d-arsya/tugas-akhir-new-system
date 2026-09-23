import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import StudentPickerTable from "@/components/student-invoices/student-picker-table"

// Legacy student-invoice/index.blade.php — pick a santri, then open their bills.
// Copy fix: the legacy breadcrumb leaf reads "Biaya Santri", which is the Data Master
// page; this page is Tagihan. Spelling typos elsewhere are kept verbatim.
export const Route = createFileRoute("/_auth/student-invoices/")({
	component: StudentInvoiceIndexPage,
})

function StudentInvoiceIndexPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle
				title="Pembayaran Santri"
				breadcrumbs={[
					{ label: "Pembayaran Santri", to: "/student-invoices" },
					{ label: "Tagihan" },
				]}
			/>

			{/* `.row > .col > .card.tbr_card > .card-body.p-4` */}
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<LegacyCard>
						<StudentPickerTable />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default StudentInvoiceIndexPage
