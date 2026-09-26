import type { JSX } from "react"

import type { ReportArrearRow, ReportOptions } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyInvoiceWidget from "@/components/legacy/legacy-invoice-widget"
import { emptyFilters, type ReportFilters } from "@/hooks/use-report-filters"
import { useReportPanel } from "@/hooks/use-report-panel"
import { useLegacyLoadError } from "@/hooks/use-legacy-load-error"
import { tableParams, useArrears } from "@/hooks/use-reports"
import { formatIndoDate, rupiahDots, rupiahLabel } from "@/lib/legacy-format"

import ReportFilterBar from "./report-filter-bar"

const COLUMNS: LegacyColumn<ReportArrearRow>[] = [
	{ key: "no", header: "No", width: "7%", cell: (_, index) => index },
	{ key: "nis", header: "NISP", width: "10%", sortable: true, cell: (row) => row.nis },
	{ key: "fullname", header: "Atas Nama", width: "15%", sortable: true, cell: (row) => row.fullname },
	{ key: "name", header: "Nama Tagihan", sortable: true, cell: (row) => row.name },
	{ key: "amount", header: "Biaya", width: "10%", sortable: true, cell: (row) => rupiahLabel(row.amount) },
	{ key: "dueDate", header: "Jatuh Tempo", width: "15%", sortable: true, cell: (row) => formatIndoDate(row.dueDate) },
	{ key: "grade", header: "Kelas", width: "10%", sortable: true, cell: (row) => row.grade },
	{ key: "subGrade", header: "Subkelas", width: "10%", sortable: true, cell: (row) => row.subGrade },
]

const resetKeepingAccountancy = (draft: ReportFilters): ReportFilters => ({ ...emptyFilters(), accountancy: draft.accountancy })

type ArrearPanelProps = { options: ReportOptions | undefined; resetSignal: number }

const ArrearPanel = ({ options, resetSignal }: ArrearPanelProps): JSX.Element => {
	const panel = useReportPanel(emptyFilters(), resetSignal, resetKeepingAccountancy)
	const query = useArrears({ ...panel.params, ...tableParams(panel.table) }, panel.reload)
	useLegacyLoadError(query.isError)

	const rows = query.data?.data ?? []
	const meta = query.data?.meta

	return (
		<>
			<ReportFilterBar
				options={options}
				selects={["accountancy", "academicYear", "grade", "subGrade"]}
				draft={panel.filters.draft}
				onDraftChange={panel.filters.setDraft}
				onFilter={panel.filter}
				exportKind="arrears"
				exportParams={panel.params}
				blockExport
			/>
			<div className="mx-[-15px] my-[24px] flex flex-wrap justify-center">
				<LegacyInvoiceWidget variant="primary" value={rows.length && meta ? rupiahDots(meta.totalArrear) : 0} label="Total tunggakan" />
				<LegacyInvoiceWidget variant="secondary" value={rows.length && meta ? meta.total : 0} label="Total item tunggakan" />
			</div>
			<LegacyDataTable
				columns={COLUMNS}
				rows={rows}
				rowKey={(row) => row.id}
				total={meta?.total ?? 0}
				state={panel.table}
				onStateChange={panel.setTable}
				processing={query.isFetching}
				loaded={query.data !== undefined}
			/>
		</>
	)
}

export default ArrearPanel
