import { useMemo, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { CapabilityHistoryRow, CapabilityStatusLabel } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import { clientTable, type TableState } from "@/lib/legacy-table"

const MONTHS_ID = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
]

const approveDateText = (local: string | null): string => {
	if (!local) return "Belum disepakati"
	const month = MONTHS_ID[Number(local.slice(5, 7)) - 1] ?? ""
	return `${local.slice(8, 10)} ${month} ${local.slice(0, 4)} jam ${local.slice(11, 16)}`
}

const LABEL_VARIANT: Record<CapabilityStatusLabel, "success" | "danger" | "warning"> = {
	Disepakati: "success",
	Dirubah: "danger",
	"Belum disepakati": "warning",
}

const cellText = (row: CapabilityHistoryRow, key: string): string => {
	switch (key) {
		case "ordinal":
			return String(row.ordinal)
		case "approveDate":
			return row.approveDateTs === null ? approveDateText(null) : `${row.approveDateTs} ${approveDateText(row.approveDate)}`
		case "itemCount":
			return String(row.itemCount)
		case "statusLabel":
			return row.statusLabel ?? ""
		case "note":
			return row.note ?? ""
		default:
			return ""
	}
}

const SEARCH_KEYS = ["ordinal", "approveDate", "itemCount", "statusLabel", "note"]

type CapabilityHistoryTableProps = {
	studentGradeId: number
	rows: CapabilityHistoryRow[] | undefined
	loaded: boolean
	processing: boolean
	state: TableState
	onStateChange: (state: TableState) => void
}

const CapabilityHistoryTable = ({
	studentGradeId,
	rows,
	loaded,
	processing,
	state,
	onStateChange,
}: CapabilityHistoryTableProps): JSX.Element => {
	const page = useMemo(() => clientTable(rows ?? [], state, cellText, SEARCH_KEYS), [rows, state])

	const columns: LegacyColumn<CapabilityHistoryRow>[] = [
		{ key: "ordinal", header: "Ke", width: "5%", sortable: true, cell: (row) => `#${row.ordinal}` },
		{ key: "approveDate", header: "Disepakati", sortable: true, cell: (row) => approveDateText(row.approveDate) },
		{ key: "itemCount", header: "Item", sortable: true, cell: (row) => row.itemCount },
		{
			key: "statusLabel",
			header: "Status",
			sortable: true,
			cell: (row) =>
				row.statusLabel === null ? null : <LegacyLabel variant={LABEL_VARIANT[row.statusLabel]}>{row.statusLabel}</LegacyLabel>,
		},
		{ key: "note", header: "Catatan", sortable: true, cell: (row) => row.note },
		{
			key: "action",
			header: "Actions",
			width: "7%",
			sortable: false,
			cell: (row) => (
				<div>
					<Link
						to="/student-capabilities/$capabilityId/students/$studentGradeId"
						params={{ capabilityId: String(row.id), studentGradeId: String(studentGradeId) }}
						className="inline-block"
					>
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} className="inline-block" />
					</Link>
				</div>
			),
		},
	]

	return (
		<LegacyDataTable
			columns={columns}
			rows={page.rows}
			rowKey={(row) => row.id}
			total={page.total}
			state={state}
			onStateChange={onStateChange}
			processing={processing}
			loaded={loaded}
			initialSort={{ key: "ordinal", dir: "desc" }}
			minWidth="725px"
			toolbar={false}
		/>
	)
}

export default CapabilityHistoryTable
