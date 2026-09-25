import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import type { EwalletTransactionKind, EwalletTransactionStatus } from "@roja/types"

import HistoryTable from "@/components/ewallet-transactions/history-table"
import HistoryToolbar from "@/components/ewallet-transactions/history-toolbar"
import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import {
	downloadEwalletHistory,
	historyDateParam,
	useEwalletHistoryTable,
	type EwalletHistoryDateRange,
	type EwalletHistoryExtra,
	type EwalletHistoryFilters,
} from "@/hooks/use-ewallet-transactions"
import { saveBlob } from "@/lib/download"
import { legacyErrors } from "@/lib/legacy-errors"
import { todayDmy } from "@/lib/legacy-format"

// Legacy ewallet/transaction-history/index.blade.php + ewallet-transaction-history-serverside.js.
// The three widgets at the top of the blade are commented out, so the page has none.
export const Route = createFileRoute("/_auth/ewallet-transactions/")({
	component: EwalletHistoryPage,
})

function EwalletHistoryPage(): JSX.Element {
	// The pickers start empty: the blade seeds `date` with today but never writes it into a picker
	const [range, setRange] = useState<EwalletHistoryDateRange>({ from: "", to: "" })
	const [filters, setFilters] = useState<EwalletHistoryFilters>({ status: "", type: "" })
	const [filterOpen, setFilterOpen] = useState(false)
	const [exporting, setExporting] = useState(false)

	const date = historyDateParam(range, todayDmy())
	const criteria: EwalletHistoryExtra = {
		...(date ? { date } : {}),
		...(filters.status ? { status: filters.status as EwalletTransactionStatus } : {}),
		...(filters.type ? { type: filters.type as EwalletTransactionKind } : {}),
	}
	const table = useEwalletHistoryTable(criteria)
	const { state, setState } = table

	// `ewalletDatatable.draw()` — a filter change starts again from the first page
	const changed = <T,>(apply: (value: T) => void) => (value: T): void => {
		apply(value)
		setState({ ...state, page: 1 })
	}

	// The export form: the same four values the hidden inputs held
	const exportReport = (): void => {
		setExporting(true)
		downloadEwalletHistory({
			...criteria,
			...(state.search ? { search: state.search } : {}),
		})
			.then((file) => saveBlob(file.blob, file.fileName ?? "Laporan Riwayat Transaksi.xlsx"))
			.catch((error: unknown) => legacyNotify.error(legacyErrors(error)))
			.finally(() => setExporting(false))
	}

	return (
		<>
			<AdminPageTitle title="Dompet" breadcrumbs={[{ label: "Dompet" }]} />

			{/* `.row.pt-0 > .col` */}
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					{/* `.card.tbr_card > .card-body.p-4`; a click anywhere on a card body hides the filter card */}
					<div onClick={() => setFilterOpen(false)}>
						<LegacyCard>
							<HistoryToolbar
								length={state.length}
								onLength={(length) => setState({ ...state, length, page: 1 })}
								search={state.search}
								onSearch={(search) => setState({ ...state, search, page: 1 })}
								range={range}
								onRange={changed(setRange)}
								filters={filters}
								onFilters={changed(setFilters)}
								filterOpen={filterOpen}
								onToggleFilter={() => setFilterOpen((open) => !open)}
								exporting={exporting}
								onExport={exportReport}
							/>
							<HistoryTable table={table} />
						</LegacyCard>
					</div>
				</div>
			</div>
		</>
	)
}

export default EwalletHistoryPage
