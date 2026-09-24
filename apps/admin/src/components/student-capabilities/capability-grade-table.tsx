import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { CapabilityGradeRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import CapabilityCostMissingModal from "@/components/student-capabilities/modals/capability-cost-missing-modal"
import { useCapabilityGrades } from "@/hooks/use-student-capabilities"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { ArrowActionIcon, CAPABILITY_ACTION_CLASS } from "./capability-icons"

type NumberedGrade = CapabilityGradeRow & { no: number }

// `Grade::masterCostStatus()` — the badge copy, which is also what the search box matches
const masterCostText = (row: CapabilityGradeRow): string => (row.masterCostDefined ? "Sudah ditentukan" : "Belum ditentukan")
// `$grade->getTotalStudentGrade($academic_year) . " Santri"`
const studentCountText = (row: CapabilityGradeRow): string => `${row.studentCount} Santri`

const cellText = (row: NumberedGrade, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "name":
			return row.name
		case "masterCost":
			return masterCostText(row)
		case "studentCount":
			return studentCountText(row)
		case "note":
			return row.note
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "name", "masterCost", "studentCount", "note"]

type CapabilityGradeTableProps = { academicYearId: number; year: string | null }

/**
 * `student-capability/grade.blade.php` + `default-datatable.js` (`initDatatable(url, [5])`).
 *
 * "Total Santri" counts `grade_status = 'active'` only, while the level-3 list behind the arrow
 * does not filter on it — so the two numbers legitimately disagree (2025/2026 Kelas 1 reads
 * "6 Santri" here and lists 43 there). Replicated, not fixed.
 *
 * A grade without an applied cost term gets the same arrow, but legacy's click handler
 * (`.tbr_student_cost_btn`, `grade.blade.php:52-57`) opens "Master biaya belum ditentukan!"
 * instead of following it; the modal's confirm then links to Data Master ▸ Biaya Santri.
 */
const CapabilityGradeTable = ({ academicYearId, year }: CapabilityGradeTableProps): JSX.Element => {
	const { data, isFetching, isSuccess } = useCapabilityGrades(academicYearId)
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [missing, setMissing] = useState<CapabilityGradeRow | null>(null)

	// `Grade::orderByDesc('label')` decides the order and the `$no` counter follows it
	const numbered = useMemo<NumberedGrade[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedGrade>[] = [
		{ key: "no", header: "No", width: "5%", sortable: true, cell: (row) => row.no },
		{ key: "name", header: "Kelas", width: "20%", sortable: true, cell: (row) => row.name },
		{
			key: "masterCost",
			header: "Master Biaya",
			width: "20%",
			sortable: true,
			cell: (row) => (
				<LegacyLabel variant={row.masterCostDefined ? "success" : "danger"}>{masterCostText(row)}</LegacyLabel>
			),
		},
		{ key: "studentCount", header: "Total Santri", width: "20%", sortable: true, cell: studentCountText },
		{ key: "note", header: "Keterangan", width: "20%", sortable: true, cell: (row) => row.note },
		{
			key: "action",
			header: "Actions",
			width: "5%",
			sortable: false,
			cell: (row) => (
				<div>
					{row.canDrillDown ? (
						<Link
							to="/student-capabilities/academic-years/$academicYearId/grades/$gradeId"
							params={{ academicYearId: String(academicYearId), gradeId: String(row.id) }}
							className={CAPABILITY_ACTION_CLASS}
						>
							<ArrowActionIcon />
						</Link>
					) : (
						<button type="button" onClick={() => setMissing(row)} className={CAPABILITY_ACTION_CLASS}>
							<ArrowActionIcon />
						</button>
					)}
				</div>
			),
		},
	]

	return (
		<>
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
				// This blade sets no inline `min-width` on the table
				minWidth="auto"
			/>
			<CapabilityCostMissingModal
				open={missing !== null}
				// `modal.js:22` — `#tbr_grade` gets `Kelas ${grade}` from the button's `data-grade`
				gradeLabel={`Kelas ${missing?.label ?? ""}`}
				academicYear={year}
				// `route('studentCost.accounts', [academic_year, grade])` — Data Master level 3
				studentCostTo={`/student-costs/${academicYearId}/grades/${missing?.id ?? ""}`}
				onCancel={() => setMissing(null)}
			/>
		</>
	)
}

export default CapabilityGradeTable
