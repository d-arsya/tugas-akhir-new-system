import { useState, type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyTabs, { type LegacyTab } from "@/components/legacy/legacy-tabs"
import InvoiceBillTab from "@/components/student-invoices/invoice-bill-tab"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import InvoiceSummaryWidgets from "@/components/student-invoices/invoice-summary-widgets"
import InvoiceTransactionTab from "@/components/student-invoices/invoice-transaction-tab"
import {
	useStudentCancelled,
	useStudentInvoiceDetail,
	useStudentPayments,
} from "@/hooks/use-student-invoices"

// Legacy student-invoice/detail.blade.php — three tabs (Tagihan, Riwayat Pembayaran,
// Dibatalkan) over one santri's invoices.
export const Route = createFileRoute("/_auth/student-invoices/$studentGradeId/")({
	component: StudentInvoiceDetailPage,
})

type TabKey = "bill" | "history" | "cancel"

function StudentInvoiceDetailPage(): JSX.Element {
	const { studentGradeId: param } = Route.useParams()
	const studentGradeId = Number(param)
	const navigate = useNavigate()

	const [active, setActive] = useState<TabKey>("bill")
	const detail = useStudentInvoiceDetail(studentGradeId)
	// Legacy builds each tab's DataTable on `shown.bs.tab`, so neither list loads until opened
	const payments = useStudentPayments(studentGradeId, active === "history")
	const cancelled = useStudentCancelled(studentGradeId, active === "cancel")

	const tabs: LegacyTab<TabKey>[] = [
		{
			key: "bill",
			label: "Tagihan",
			content: (
				<InvoiceBillTab
					studentGradeId={studentGradeId}
					costOptions={detail.data?.costOptions ?? []}
					onCreateTransaction={(invoiceIds) => {
						// The tick list travels in the URL, which is what the payment page reads.
						// Legacy put it in one global session key that `createTransaction` then
						// ignored, so two tabs paid santri A's invoices against santri B (F-5);
						// carrying it here also lets the trash icon re-price by editing the URL,
						// the way legacy's `?invoice_id=N` reload did.
						void navigate({
							to: "/student-invoices/$studentGradeId/create-transaction",
							params: { studentGradeId: param },
							search: { invoices: invoiceIds.join(",") },
						})
					}}
				/>
			),
		},
		{
			key: "history",
			label: "Riwayat Pembayaran",
			content: (
				<InvoiceTransactionTab
					rows={payments.data ?? []}
					loaded={payments.isSuccess || payments.isError}
					processing={payments.isFetching}
					variant="payments"
				/>
			),
		},
		{
			key: "cancel",
			label: "Dibatalkan",
			content: (
				<InvoiceTransactionTab
					rows={cancelled.data ?? []}
					loaded={cancelled.isSuccess || cancelled.isError}
					processing={cancelled.isFetching}
					variant="cancelled"
				/>
			),
		},
	]

	return (
		<>
			<AdminPageTitle
				title="Detail Pembayaran"
				breadcrumbs={[
					{ label: "Pembayaran Santri", to: "/student-invoices" },
					{ label: "Tagihan", to: "/student-invoices" },
					{ label: "Detail" },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full px-[15px] min-[992px]:w-1/4">
					{detail.data ? <LegacyStudentCard student={detail.data.student} className="mb-[16px]" /> : null}
				</div>
				<div className="w-full px-[15px] min-[992px]:w-3/4">
					<InvoiceSummaryWidgets
						summary={detail.data?.summary ?? { totalUnpaid: 0, unpaidItemCount: 0, installmentItemCount: 0 }}
					/>
					{/* `.row.justify-content-center > .col-md-12` */}
					<div className="mx-[-15px] flex flex-wrap justify-center">
						<div className="w-full px-[15px]">
							<LegacyTabs tabs={tabs} active={active} onChange={setActive} />
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default StudentInvoiceDetailPage
