import { useMemo, useState, type JSX } from "react"

import type { AdminStudentYearRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { useStudentAcademicYears } from "@/hooks/use-students"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { StudentLabel, YearDetailAction } from "./student-ui"

type NumberedYear = AdminStudentYearRow & { no: number }

const cellText = (row: NumberedYear, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "year":
			return row.year ?? ""
		case "levelCount":
			return `${row.levelCount} Jenjang`
		case "gradeCount":
			return `${row.gradeCount} Kelas`
		case "studentCount":
			return `${row.studentCount} Santri`
		case "statusLabel":
			return row.statusLabel ?? ""
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "year", "levelCount", "gradeCount", "studentCount", "statusLabel"]

const columns: LegacyColumn<NumberedYear>[] = [
	{ key: "no", header: "No", sortable: true, cell: (row) => row.no },
	{ key: "year", header: "Tahun Ajaran", sortable: true, cell: (row) => row.year },
	{ key: "levelCount", header: "Total Jenjang", sortable: true, cell: (row) => cellText(row, "levelCount") },
	{ key: "gradeCount", header: "Total Kelas", sortable: true, cell: (row) => cellText(row, "gradeCount") },
	{ key: "studentCount", header: "Total Santri", sortable: true, cell: (row) => cellText(row, "studentCount") },
	{
		key: "statusLabel",
		header: "Status tahun ajaran",
		sortable: true,
		cell: (row) =>
			row.statusLabel === null ? null : row.statusLabel === "-" ? (
				"-"
			) : (
				<StudentLabel variant={row.statusLabel === "Berjalan" ? "success" : "danger"}>{row.statusLabel}</StudentLabel>
			),
	},
	{ key: "action", header: "Actions", sortable: false, cell: (row) => <YearDetailAction academicYearId={row.id} /> },
]

const StudentYearTable = (): JSX.Element => {
	const { data, isFetching, isSuccess } = useStudentAcademicYears()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)

	const numbered = useMemo<NumberedYear[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

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

export default StudentYearTable
