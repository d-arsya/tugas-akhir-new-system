import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { CapabilityAcademicYearRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import { useCapabilityAcademicYears } from "@/hooks/use-student-capabilities"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { ArrowActionIcon, CAPABILITY_ACTION_CLASS } from "./capability-icons"

// The `$no` counter legacy bakes into the payload, so it keeps its value when the table is re-sorted
type NumberedYear = CapabilityAcademicYearRow & { no: number }

const cellText = (row: NumberedYear, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "year":
			return row.year ?? ""
		case "costPeriod":
			return row.costPeriod
		case "statusLabel":
			return row.statusLabel ?? ""
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "year", "costPeriod", "statusLabel"]

/**
 * `student-capability/academic-year.blade.php` + `default-datatable.js` (`initDatatable(url, [4])`).
 *
 * `AcademicYearService::getStatusAkademik()` renders green "Berjalan", red "Berakhir", the bare
 * text "-" for the Archive sentinel, and nothing at all for a running or future period on a
 * non-current year — `statusLabel: null`.
 */
const CapabilityYearTable = (): JSX.Element => {
	const { data, isFetching, isSuccess } = useCapabilityAcademicYears()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)

	const numbered = useMemo<NumberedYear[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedYear>[] = [
		{ key: "no", header: "No", width: "10%", sortable: true, cell: (row) => row.no },
		{ key: "year", header: "Tahun Ajaran", width: "30%", sortable: true, cell: (row) => row.year },
		{ key: "costPeriod", header: "Periode", width: "25%", sortable: true, cell: (row) => row.costPeriod },
		{
			key: "statusLabel",
			header: "Status tahun ajaran",
			width: "30%",
			sortable: true,
			cell: (row) =>
				row.statusLabel === null ? null : row.statusLabel === "-" ? (
					"-"
				) : (
					<LegacyLabel variant={row.statusLabel === "Berjalan" ? "success" : "danger"}>{row.statusLabel}</LegacyLabel>
				),
		},
		{
			// `<th witdh="5%">` — the typo means the width never applied
			key: "action",
			header: "",
			sortable: false,
			cell: (row) => (
				// `StudentCostService::action($studentCapabilityUrl)`
				<div>
					<Link
						to="/student-capabilities/academic-years/$academicYearId"
						params={{ academicYearId: String(row.id) }}
						className={CAPABILITY_ACTION_CLASS}
					>
						<ArrowActionIcon />
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
			onStateChange={setState}
			processing={isFetching}
			loaded={isSuccess}
			initialSort={{ key: "no", dir: "asc" }}
			minWidth="950px"
		/>
	)
}

export default CapabilityYearTable
