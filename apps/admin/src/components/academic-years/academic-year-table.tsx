import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AcademicYearDeleteTarget, AcademicYearRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import { useAcademicYears } from "@/hooks/use-academic-years"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

// The `$no` counter legacy bakes into the payload, so it keeps its value when the table is re-sorted
type NumberedYear = AcademicYearRow & { no: number }

/** `AcademicYearService::delegateAction()` picks the destroy link's target server-side, per row. */
const DELETE_ROUTE: Record<AcademicYearDeleteTarget, string> = {
	delete: "/academic-years/$academicYearId/delete",
	"delegate-registrant": "/academic-years/$academicYearId/delegate-registrant",
	"delegate-student": "/academic-years/$academicYearId/delegate-student",
	"delegate-alumni": "/academic-years/$academicYearId/delegate-alumni",
}

// `getStatus()` — the Archive row renders a bare "-" instead of a badge
const statusPsbText = (row: AcademicYearRow): string =>
	row.statusPsb === "none" ? "-" : row.statusPsb === "open" ? "Dibuka" : "Ditutup"

// `getStatusAkademik()` — "empty" is the blank cell a running or future period gets on a non-current year
const statusAkademikText = (row: AcademicYearRow): string =>
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
		case "statusPsb":
			return statusPsbText(row)
		case "statusAkademik":
			return statusAkademikText(row)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "year", "period", "statusPsb", "statusAkademik"]

// `academic-year/index.blade.php` + `default-datatable.js` (`initDatatable(url, [5])`)
const AcademicYearTable = (): JSX.Element => {
	const { data, isFetching, isSuccess } = useAcademicYears()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)

	const numbered = useMemo<NumberedYear[]>(
		() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })),
		[data],
	)
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedYear>[] = [
		{ key: "no", header: "No", sortable: true, cell: (row) => row.no },
		{ key: "year", header: "Tahun Ajaran", sortable: true, cell: (row) => row.year },
		{ key: "period", header: "Periode", sortable: true, cell: (row) => row.period },
		{
			key: "statusPsb",
			header: "Status PSB",
			sortable: true,
			cell: (row) =>
				row.statusPsb === "none" ? (
					"-"
				) : (
					<LegacyLabel variant={row.statusPsb === "open" ? "success" : "danger"}>{statusPsbText(row)}</LegacyLabel>
				),
		},
		{
			key: "statusAkademik",
			header: "S. Akademik",
			sortable: true,
			// A future-or-running period on a non-current year renders nothing at all — kept as legacy
			cell: (row) =>
				row.statusAkademik === "none" ? (
					"-"
				) : row.statusAkademik === "empty" ? null : (
					<LegacyLabel variant={row.statusAkademik === "berjalan" ? "success" : "danger"}>
						{statusAkademikText(row)}
					</LegacyLabel>
				),
		},
		{
			key: "actions",
			header: "Actions",
			// `initDatatable(url, [5])`
			sortable: false,
			// `delegateAction()` returns "" for the Archive row: no edit icon and no destroy icon
			cell: (row) =>
				row.actionable ? (
					// `.table .actions a { display: inline-block; margin-right: 5px }` plus the newline
					// Blade leaves between the two anchors — 5px + ~3.73px = the 8.73px legacy renders
					<div className="align-middle">
						<Link
							to="/academic-years/$academicYearId/edit"
							params={{ academicYearId: String(row.id) }}
							className="mr-[5px] inline-block align-middle"
						>
							<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} className="inline-block" />
						</Link>{" "}
						<Link
							to={DELETE_ROUTE[row.deleteTarget]}
							params={{ academicYearId: String(row.id) }}
							className="inline-block align-middle"
						>
							<img src="/assets/svg/icons/data_destroy.svg" alt="Destroy" width={24} height={24} className="inline-block" />
						</Link>
					</div>
				) : null,
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
			// Unlike the other lists, this blade sets no inline `min-width` on the table
			minWidth="auto"
		/>
	)
}

export default AcademicYearTable
