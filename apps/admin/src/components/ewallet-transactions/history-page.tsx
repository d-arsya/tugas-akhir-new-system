import { useState, type JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import {
	historyCriteria,
	useDownloadEwalletHistory,
	useEwalletHistoryTable,
	type EwalletHistoryDateRange,
	type EwalletHistoryFilters,
} from "@/hooks/use-ewallet-transactions"
import { todayDmy } from "@/lib/legacy-format"

import HistoryTable from "./history-table"
import HistoryToolbar from "./history-toolbar"

const EwalletHistoryPage = (): JSX.Element => {
	const [range, setRange] = useState<EwalletHistoryDateRange>({ from: "", to: "" })
	const [filters, setFilters] = useState<EwalletHistoryFilters>({ status: "", type: "" })
	const [filterOpen, setFilterOpen] = useState(false)
	const download = useDownloadEwalletHistory()

	const criteria = historyCriteria(range, filters, todayDmy())
	const table = useEwalletHistoryTable(criteria)
	const { state, setState } = table

	const changed = <T,>(apply: (value: T) => void) => (value: T): void => {
		apply(value)
		setState({ ...state, page: 1 })
	}

	const exportReport = (): void => {
		download.mutate({
			...criteria,
			...(state.search ? { search: state.search } : {}),
		})
	}

	return (
		<>
			<AdminPageTitle title="Dompet" breadcrumbs={[{ label: "Dompet" }]} />

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
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
								exporting={download.isPending}
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
