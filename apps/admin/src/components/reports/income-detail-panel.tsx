import type { JSX } from "react"

import type { ReportIncomeDetailRow, ReportOptions } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyInvoiceWidget from "@/components/legacy/legacy-invoice-widget"
import { todayFilters } from "@/hooks/use-report-filters"
import { useReportPanel } from "@/hooks/use-report-panel"
import { useLegacyLoadError } from "@/hooks/use-legacy-load-error"
import { tableParams, useIncomeDetail } from "@/hooks/use-reports"
import { formatIndoDate, rupiahDots, rupiahLabel } from "@/lib/legacy-format"

import IncomeDescriptionCell from "./income-description-cell"
import ReportFilterBar from "./report-filter-bar"

const COLUMNS: LegacyColumn<ReportIncomeDetailRow>[] = [
	{ key: "no", header: "No", width: "7%", cell: (_, index) => index },
	{
		key: "code",
		header: "ID Pembayaran",
		sortable: true,
		cell: (row) => (
			<>
				<div className="font-semibold text-[var(--primary)]">{row.code}</div>{" "}
				<div className="text-[var(--grey)]">{formatIndoDate(row.paidAt, true)}</div>
			</>
		),
	},
	{ key: "fullname", header: "Atas Nama", width: "15%", sortable: true, cell: (row) => row.fullname },
	{ key: "nis", header: "NISP", width: "10%", sortable: true, cell: (row) => row.nis },
	{ key: "amount", header: "Nominal", width: "15%", sortable: true, cell: (row) => rupiahLabel(row.amount) },
	{
		key: "description",
		header: "Keterangan",
		width: "15%",
		sortable: true,
		cell: (row) => <IncomeDescriptionCell description={row.description} />,
	},
	{ key: "grade", header: "Kelas", width: "10%", sortable: true, cell: (row) => row.grade },
	{ key: "subGrade", header: "Subkelas", width: "10%", sortable: true, cell: (row) => row.subGrade },
]

type IncomeDetailPanelProps = { options: ReportOptions | undefined; resetSignal: number }

const IncomeDetailPanel = ({ options, resetSignal }: IncomeDetailPanelProps): JSX.Element => {
	const panel = useReportPanel(todayFilters(), resetSignal, todayFilters)
	const query = useIncomeDetail({ ...panel.params, ...tableParams(panel.table) }, panel.reload)
	useLegacyLoadError(query.isError)

	const rows = query.data?.data ?? []
	const meta = query.data?.meta

	return (
		<>
			<ReportFilterBar
				options={options}
				selects={["academicYear", "grade", "subGrade"]}
				draft={panel.filters.draft}
				onDraftChange={panel.filters.setDraft}
				onFilter={panel.filter}
				exportKind="income-detail"
				exportParams={panel.params}
			/>
			<div className="mx-[-15px] my-[24px] flex flex-wrap justify-center">
				<LegacyInvoiceWidget variant="primary" value={rows.length && meta ? rupiahDots(meta.totalIncome) : 0} label="Total uang masuk" />
				<LegacyInvoiceWidget variant="secondary" value={rows.length && meta ? meta.total : 0} label="Total item pembayaran" />
			</div>
			<LegacyDataTable
				columns={COLUMNS}
				rows={rows}
				rowKey={(row) => row.code}
				total={meta?.total ?? 0}
				state={panel.table}
				onStateChange={panel.setTable}
				processing={query.isFetching}
				loaded={query.data !== undefined}
			/>
		</>
	)
}

export default IncomeDetailPanel
