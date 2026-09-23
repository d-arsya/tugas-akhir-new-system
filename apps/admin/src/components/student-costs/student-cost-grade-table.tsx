import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentCostGradeRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { ChevronActionIcon } from "@/components/legacy/legacy-icons"
import { useStudentCostGrades } from "@/hooks/use-student-costs"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { STUDENT_COST_ACTION_CLASS } from "./student-cost-action"

type NumberedGrade = StudentCostGradeRow & { no: number }

const cellText = (row: NumberedGrade, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "name":
			return row.name
		case "appliedText":
			return row.appliedText
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "name", "appliedText"]

// `student-cost-term/grade.blade.php` + `default-datatable.js` (`initDatatable(url, [3])`)
const StudentCostGradeTable = ({ academicYearId }: { academicYearId: number }): JSX.Element => {
	const { data, isFetching, isSuccess } = useStudentCostGrades(academicYearId)
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)

	// `Grade::orderByDesc('label')` decides the order and the `$no` counter follows it
	const numbered = useMemo<NumberedGrade[]>(
		() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })),
		[data],
	)
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedGrade>[] = [
		{ key: "no", header: "No", width: "19%", sortable: true, cell: (row) => row.no },
		{ key: "name", header: "Kelas", width: "40%", sortable: true, cell: (row) => row.name },
		{
			key: "appliedText",
			header: "Item digunakan",
			width: "40%",
			sortable: true,
			cell: (row) => row.appliedText,
		},
		{
			key: "action",
			header: "Actions",
			width: "1%",
			sortable: false,
			cell: (row) => (
				<div>
					<Link
						to="/student-costs/$academicYearId/grades/$gradeId"
						params={{ academicYearId: String(academicYearId), gradeId: String(row.gradeId) }}
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
			rowKey={(row) => row.gradeId}
			total={page.total}
			state={state}
			onStateChange={setState}
			processing={isFetching}
			loaded={isSuccess}
			initialSort={{ key: "no", dir: "asc" }}
			// This blade sets no inline `min-width` on the table
			minWidth="auto"
		/>
	)
}

export default StudentCostGradeTable
