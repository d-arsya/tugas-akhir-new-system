import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import StudentPickerTable from "@/components/student-invoices/student-picker-table"

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
