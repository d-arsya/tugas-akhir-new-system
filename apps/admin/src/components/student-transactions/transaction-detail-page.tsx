import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import { useStudentTransaction } from "@/hooks/use-student-transactions"

import TransactionDetailHeader from "./transaction-detail-header"
import TransactionDetailTables from "./transaction-detail-tables"
import TransactionNoteForm from "./transaction-note-form"

const TransactionDetailPage = ({ transactionId }: { transactionId: number }): JSX.Element => {
	const query = useStudentTransaction(transactionId)
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
				<div className="mx-[-15px] flex flex-wrap">
					<div className="w-full px-[15px] min-[992px]:w-3/12">
						<LegacyStudentCard student={detail.student} className="mb-[24px]" />
					</div>

					<div className="w-full px-[15px] min-[992px]:w-9/12">
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

export default TransactionDetailPage
