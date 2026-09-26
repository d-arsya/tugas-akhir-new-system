import { useState, type JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import type { TransactionDateRange } from "@/hooks/use-student-transactions"
import { todayDmy } from "@/lib/legacy-format"

import StudentTransactionTable from "./student-transaction-table"

const TransactionListPage = (): JSX.Element => {
	const [range, setRange] = useState<TransactionDateRange>(() => ({ from: todayDmy(), to: todayDmy() }))

	return (
		<>
			<AdminPageTitle
				title="Pembayaran Santri"
				breadcrumbs={[
					{ label: "Pembayaran Santri", to: "/student-transactions" },
					{ label: "Riwayat Pembayaran" },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<LegacyCard bodyClassName="p-[24px]">
						<StudentTransactionTable range={range} onRangeChange={setRange} />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default TransactionListPage
