import { useState, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { InvoiceTransactionRow } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import LegacyTabs, { type LegacyTab } from "@/components/legacy/legacy-tabs"
import CancelTransactionModal from "@/components/payments/cancel-transaction-modal"
import { useCancelTransaction } from "@/hooks/use-payments"
import {
	useStudentCancelled,
	useStudentInvoiceDetail,
	useStudentPayments,
} from "@/hooks/use-student-invoices"

import InvoiceBillTab from "./invoice-bill-tab"
import InvoiceSummaryWidgets from "./invoice-summary-widgets"
import InvoiceTransactionTab from "./invoice-transaction-tab"

type TabKey = "bill" | "history" | "cancel"

const EMPTY_SUMMARY = { totalUnpaid: 0, unpaidItemCount: 0, installmentItemCount: 0 }

const InvoiceDetailPage = ({ studentGradeId: param }: { studentGradeId: string }): JSX.Element => {
	const studentGradeId = Number(param)
	const navigate = useNavigate()

	const [active, setActive] = useState<TabKey>("bill")
	const detail = useStudentInvoiceDetail(studentGradeId)
	const payments = useStudentPayments(studentGradeId, active === "history")
	const cancelled = useStudentCancelled(studentGradeId, active === "cancel")
	const [cancelling, setCancelling] = useState<InvoiceTransactionRow | null>(null)
	const cancel = useCancelTransaction(() => {
		setCancelling(null)
		setActive("cancel")
	})

	const tabs: LegacyTab<TabKey>[] = [
		{
			key: "bill",
			label: "Tagihan",
			content: (
				<InvoiceBillTab
					studentGradeId={studentGradeId}
					costOptions={detail.data?.costOptions ?? []}
					onCreateTransaction={(invoiceIds) => {
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
					onCancel={setCancelling}
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
					<InvoiceSummaryWidgets summary={detail.data?.summary ?? EMPTY_SUMMARY} />
					<div className="mx-[-15px] flex flex-wrap justify-center">
						<div className="w-full px-[15px]">
							<LegacyTabs tabs={tabs} active={active} onChange={setActive} />
						</div>
					</div>
				</div>
			</div>

			<CancelTransactionModal
				open={cancelling !== null}
				submitting={cancel.submitting}
				onCancel={() => setCancelling(null)}
				onConfirm={(cancelNote) => {
					if (cancelling) cancel.submit({ transactionId: cancelling.id, cancelNote })
				}}
			/>
		</>
	)
}

export default InvoiceDetailPage
