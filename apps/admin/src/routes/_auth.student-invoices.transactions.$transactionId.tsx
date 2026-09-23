import { useEffect, useRef, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import PaymentDetailHeader from "@/components/payments/payment-detail-header"
import PaymentNoteForm from "@/components/payments/payment-note-form"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import TransactionDetailTables from "@/components/student-transactions/transaction-detail-tables"
import { useDownloadReceipt } from "@/hooks/use-payments"
import { useStudentTransaction } from "@/hooks/use-student-transactions"

// Legacy student-invoice/detail-history.blade.php — one payment, its invoices, and the
// cancel flow. Copy fix: legacy titles this page "Detail Tagihan" though it shows a
// payment, not a bill.
//
// The same blade is also reached from Riwayat Transaksi, which is P1-C's route. The two tables in
// the middle are identical either way, so they are imported rather than transcribed a second
// time; the header and the note form differ (back link, the "Dibatalkan" badge, and the
// cancellation-reason textarea) and are this page's own.
export const Route = createFileRoute("/_auth/student-invoices/transactions/$transactionId")({
	validateSearch: (search: Record<string, unknown>): { download?: string } =>
		typeof search["download"] === "string" ? { download: search["download"] } : {},
	component: InvoicePaymentPage,
})

// `detail-history.blade.php:228` — `setTimeout(… 700)` after the redirect from storeTransaction
const AUTO_DOWNLOAD_MS = 700

function InvoicePaymentPage(): JSX.Element {
	const { transactionId } = Route.useParams()
	const { download } = Route.useSearch()
	const detail = useStudentTransaction(Number(transactionId))
	const receipt = useDownloadReceipt(Number(transactionId))

	// Legacy reads `?download=yes` and sends the browser to the download route 700 ms later, which
	// is how the receipt reaches the bendahara straight after a payment is saved. Fired once: a
	// refetch or a re-render must not download a second copy.
	const fired = useRef(false)
	const start = receipt.mutate
	useEffect(() => {
		if (download !== "yes" || fired.current) return
		fired.current = true
		const timer = window.setTimeout(() => start(), AUTO_DOWNLOAD_MS)
		return () => window.clearTimeout(timer)
	}, [download, start])

	const studentGradeId = String(detail.data?.student.studentGradeId ?? "")

	return (
		<>
			<AdminPageTitle
				title="Detail Pembayaran"
				breadcrumbs={[
					{ label: "Pembayaran Santri", dropdown: [{ label: "Pembayaran Santri", to: "/student-invoices" }] },
					{ label: "Tagihan", to: "/student-invoices" },
					{ label: "Detail" },
					{ label: "Detail Pembayaran" },
				]}
			/>

			{detail.data ? (
				// `.row`
				<div className="mx-[-15px] flex flex-wrap">
					{/* `.col-lg-3` */}
					<div className="w-full px-[15px] min-[992px]:w-3/12">
						<LegacyStudentCard student={detail.data.student} className="mb-[24px]" />
					</div>

					{/* `.col-lg-9` */}
					<div className="w-full px-[15px] min-[992px]:w-9/12">
						{/* `.card.tbr_card.mb-4 > .card-body.p-4` */}
						<LegacyCard className="mb-[24px]">
							<PaymentDetailHeader
								detail={detail.data}
								studentGradeId={studentGradeId}
								downloading={receipt.isPending}
								onDownload={() => receipt.mutate()}
							/>
							<TransactionDetailTables detail={detail.data} />
						</LegacyCard>

						<PaymentNoteForm
							detail={detail.data}
							studentGradeId={studentGradeId}
							onSaved={() => void detail.refetch()}
						/>
					</div>
				</div>
			) : null}
		</>
	)
}

export default InvoicePaymentPage
