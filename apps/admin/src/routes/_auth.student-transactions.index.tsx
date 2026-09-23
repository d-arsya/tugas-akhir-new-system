import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import StudentTransactionTable from "@/components/student-transactions/student-transaction-table"
import type { TransactionDateRange } from "@/hooks/use-student-transactions"
import { todayDmy } from "@/lib/legacy-format"

// Legacy student-transaction/index.blade.php — every valid payment, date-range filtered.
// Legacy reuses the Tagihan page header here, so its breadcrumb leaf reads "Biaya Santri";
// corrected to the page's own name.
export const Route = createFileRoute("/_auth/student-transactions/")({
	component: StudentTransactionIndexPage,
})

function StudentTransactionIndexPage(): JSX.Element {
	/*
	 * `index.blade.php:132-136` seeds both datepickers with today
	 * (`DateTime.now().toFormat("dd/LL/yyyy")`), while the `value=` attributes at `:48` and `:59`
	 * are commented out. The seeding runs at parse time, before `initDatatables` fires, so the
	 * very first draw already carries today on both ends.
	 */
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

			{/* `.row > .col` */}
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					{/* `.card.tbr_card > .card-body.p-4` */}
					<LegacyCard bodyClassName="p-[24px]">
						<StudentTransactionTable range={range} onRangeChange={setRange} />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default StudentTransactionIndexPage
