import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import TransactionDetailHeader from "@/components/student-transactions/transaction-detail-header"
import TransactionDetailTables from "@/components/student-transactions/transaction-detail-tables"
import TransactionNoteForm from "@/components/student-transactions/transaction-note-form"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import { useStudentTransaction } from "@/hooks/use-student-transactions"

// Legacy student-transaction/detail.blade.php. Copy fix: legacy titles this "Detail
// Tagihan" though it shows a payment.
export const Route = createFileRoute("/_auth/student-transactions/$transactionId")({
	component: StudentTransactionDetailPage,
})

function StudentTransactionDetailPage(): JSX.Element {
	const { transactionId } = Route.useParams()
	const query = useStudentTransaction(Number(transactionId))
	const detail = query.data

	return (
		<>
			<AdminPageTitle
				title="Detail Pembayaran"
				breadcrumbs={[
					{ label: "Pembayaran Santri", to: "/student-transactions" },
					{ label: "Riwayat Pembayaran", to: "/student-transactions" },
					{ label: "Detail Pembayaran" },
				]}
			/>

			{detail ? (
				// `.row`
				<div className="mx-[-15px] flex flex-wrap">
					{/* `.col-lg-3` */}
					<div className="w-full px-[15px] min-[992px]:w-3/12">
						<LegacyStudentCard student={detail.student} className="mb-[24px]" />
					</div>

					{/* `.col-lg-9` */}
					<div className="w-full px-[15px] min-[992px]:w-9/12">
						{/* `.card.tbr_card.mb-4 > .card-body.p-4` */}
						<LegacyCard className="mb-[24px]">
							<TransactionDetailHeader detail={detail} />
							<TransactionDetailTables detail={detail} />
						</LegacyCard>

						<TransactionNoteForm detail={detail} />
					</div>
				</div>
			) : null}
		</>
	)
}

export default StudentTransactionDetailPage
