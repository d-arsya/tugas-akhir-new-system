import { useEffect, useRef, type JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import TransactionDetailTables from "@/components/student-transactions/transaction-detail-tables"
import { useDownloadReceipt } from "@/hooks/use-payments"
import { useStudentTransaction } from "@/hooks/use-student-transactions"

import PaymentDetailHeader from "./payment-detail-header"
import PaymentNoteForm from "./payment-note-form"

const AUTO_DOWNLOAD_MS = 700

type PaymentDetailPageProps = { transactionId: number; download: string | undefined }

const PaymentDetailPage = ({ transactionId, download }: PaymentDetailPageProps): JSX.Element => {
	const detail = useStudentTransaction(transactionId)
	const receipt = useDownloadReceipt(transactionId)

	const autoDownloaded = useRef(false)
	const startDownload = receipt.mutate
	useEffect(() => {
		if (download !== "yes" || autoDownloaded.current) return
		autoDownloaded.current = true
		const timer = window.setTimeout(() => startDownload(), AUTO_DOWNLOAD_MS)
		return () => window.clearTimeout(timer)
	}, [download, startDownload])

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
				<div className="mx-[-15px] flex flex-wrap">
					<div className="w-full px-[15px] min-[992px]:w-3/12">
						<LegacyStudentCard student={detail.data.student} className="mb-[24px]" />
					</div>

					<div className="w-full px-[15px] min-[992px]:w-9/12">
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

export default PaymentDetailPage
