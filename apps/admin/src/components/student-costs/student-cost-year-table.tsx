import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentCostYearRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { ChevronActionIcon } from "@/components/legacy/legacy-icons"
import LegacyLabel from "@/components/legacy/legacy-label"
import { useStudentCostYears } from "@/hooks/use-student-costs"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { STUDENT_COST_ACTION_CLASS } from "./student-cost-action"

// The `$no` counter legacy bakes into the payload, so it keeps its value when the table is re-sorted
type NumberedYear = StudentCostYearRow & { no: number }

// `AcademicYearService::getStatusAkademik()` — "empty" is the blank cell a running or future
// period gets on a non-current year, and "none" is the Archive row, which this list never shows
const statusText = (row: StudentCostYearRow): string =>
	row.statusAkademik === "none"
		? "-"
		: row.statusAkademik === "berjalan"
			? "Berjalan"
			: row.statusAkademik === "berakhir"
				? "Berakhir"
				: ""

const cellText = (row: NumberedYear, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "year":
			return row.year ?? ""
		case "period":
			return row.period
		case "statusAkademik":
			return statusText(row)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "year", "period", "statusAkademik"]

// `student-cost-term/index.blade.php` + `default-datatable.js` (`initDatatable(url, [4])`)
const StudentCostYearTable = (): JSX.Element => {
	const { data, isFetching, isSuccess } = useStudentCostYears()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)

	const numbered = useMemo<NumberedYear[]>(
		() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })),
		[data],
	)
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedYear>[] = [
		{ key: "no", header: "No", width: "10%", sortable: true, cell: (row) => row.no },
		{ key: "year", header: "Tahun Ajaran", width: "30%", sortable: true, cell: (row) => row.year },
		{ key: "period", header: "Periode", width: "25%", sortable: true, cell: (row) => row.period },
		{
			key: "statusAkademik",
			header: "Status tahun ajaran",
			width: "30%",
			sortable: true,
			// A future-or-running period on a non-current year renders nothing at all — kept as legacy
			cell: (row) =>
				row.statusAkademik === "none" ? (
					"-"
				) : row.statusAkademik === "empty" ? null : (
					<LegacyLabel variant={row.statusAkademik === "berjalan" ? "success" : "danger"}>
						{statusText(row)}
					</LegacyLabel>
				),
		},
		{
			// The header is an empty `<th witdh="5%">` — the typo means the width never applied
			key: "action",
			header: "",
			sortable: false,
			cell: (row) => (
				// `StudentCostService::action()` — a plain anchor, so legacy does a full page load
				<div>
					<Link
						to="/student-costs/$academicYearId"
						params={{ academicYearId: String(row.id) }}
						className={STUDENT_COST_ACTION_CLASS}
					>
						<ChevronActionIcon />
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

export default StudentCostYearTable
