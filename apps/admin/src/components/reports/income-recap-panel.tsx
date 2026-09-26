import type { JSX } from "react"

import type { ReportOptions } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyInvoiceWidget from "@/components/legacy/legacy-invoice-widget"
import { todayFilters } from "@/hooks/use-report-filters"
import { useReportPanel } from "@/hooks/use-report-panel"
import { useLegacyLoadError } from "@/hooks/use-legacy-load-error"
import { useIncomeRecap } from "@/hooks/use-reports"
import { rupiahDots, rupiahLabel } from "@/lib/legacy-format"
import { clientTable } from "@/lib/legacy-table"

import ReportFilterBar from "./report-filter-bar"

type RecapRow = { accName: string; totalAmount: number }

// Search and sort run on the formatted "Rp …" text, not on the number
const cellText = (row: RecapRow, key: string): string => (key === "accName" ? row.accName : rupiahLabel(row.totalAmount))

const COLUMNS: LegacyColumn<RecapRow>[] = [
	{ key: "no", header: "No", width: "7%", cell: (_, index) => index },
	{ key: "accName", header: "Nama Biaya", sortable: true, cell: (row) => row.accName },
	{ key: "totalAmount", header: "Uang Masuk", sortable: true, cell: (row) => rupiahLabel(row.totalAmount) },
]

type IncomeRecapPanelProps = {
	options: ReportOptions | undefined
	resetSignal: number
	started: boolean
}

const IncomeRecapPanel = ({ options, resetSignal, started }: IncomeRecapPanelProps): JSX.Element => {
	const panel = useReportPanel(todayFilters(), resetSignal, todayFilters)
	const { search: _search, ...filterParams } = panel.params
	const query = useIncomeRecap(filterParams, panel.reload, started)
	useLegacyLoadError(query.isError)

	const recap = query.data
	const page = clientTable(recap?.rows ?? [], panel.table, cellText, ["accName", "totalAmount"])

	return (
		<>
			<ReportFilterBar
				options={options}
				selects={["academicYear", "grade", "subGrade"]}
				draft={panel.filters.draft}
				onDraftChange={panel.filters.setDraft}
				onFilter={panel.filter}
				exportKind="income-recap"
				exportParams={filterParams}
			/>
			<div className="mx-[-15px] my-[24px] flex flex-wrap justify-center">
				<LegacyInvoiceWidget variant="primary" value={page.rows.length && recap ? rupiahDots(recap.totalAmount) : 0} label="Total uang masuk" />
				<LegacyInvoiceWidget variant="secondary" value={page.rows.length && recap ? recap.totalData : 0} label="Total item pembayaran" />
			</div>
			<LegacyDataTable
				columns={COLUMNS}
				rows={page.rows}
				rowKey={(row) => row.accName}
				total={page.total}
				state={panel.table}
				onStateChange={panel.setTable}
				processing={query.isFetching}
				loaded={recap !== undefined}
			/>
		</>
	)
}

export default IncomeRecapPanel
