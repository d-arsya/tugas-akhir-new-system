import { useMemo, useRef, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminStudentGradeRow } from "@roja/types"

import LegacyConfirmDelete from "@/components/legacy/legacy-confirm-delete"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import { useStudentGradeDelete, useStudentGrades } from "@/hooks/use-students"
import { legacyErrors } from "@/lib/legacy-errors"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { ACTION_LINK_CLASS, DETAIL_ICON, DestroyAction } from "./student-ui"

// Legacy `student/grade.blade.php` table + `default-datatable.js` (`initDatatable(url, [7])`) over
// `StudentController::gradeList:111-152`, and `default-delete.js` for the delete icon, which calls
// `deleteStudentByGrade` (the grade in this year, whatever its level — kept legacy).

type NumberedGrade = AdminStudentGradeRow & { no: number }

const santri = (count: number): string => `${count} Santri`

const cellText = (row: NumberedGrade, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "grade":
			return `Kelas ${row.grade ?? ""}`
		case "levelName":
			return row.levelName ?? ""
		case "total":
			return santri(row.total)
		case "active":
			return santri(row.active)
		case "naikKelas":
			return santri(row.naikKelas)
		case "tinggalKelas":
			return santri(row.tinggalKelas)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "grade", "levelName", "total", "active", "naikKelas", "tinggalKelas"]

// `default-delete.js`: the popup closes 1000 ms after the answer, success or failure
const CLOSE_AFTER_MS = 1000

const StudentGradeTable = ({ academicYearId }: { academicYearId: number }): JSX.Element => {
	const { data, isFetching, isSuccess } = useStudentGrades(academicYearId)
	const remove = useStudentGradeDelete()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [pending, setPending] = useState<NumberedGrade | null>(null)
	const [busy, setBusy] = useState(false)
	const timer = useRef<number | undefined>(undefined)

	const numbered = useMemo<NumberedGrade[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const closeLater = (): void => {
		timer.current = window.setTimeout(() => {
			setBusy(false)
			setPending(null)
		}, CLOSE_AFTER_MS)
	}

	const confirm = (): void => {
		if (!pending || pending.grade === null || busy) return
		setBusy(true)
		remove
			.mutateAsync({ academicYearId, grade: pending.grade })
			.then((result) => legacyNotify.success(result.message))
			.catch((error: unknown) => legacyNotify.error(legacyErrors(error)))
			.finally(closeLater)
	}

	const columns: LegacyColumn<NumberedGrade>[] = [
		{ key: "no", header: "No", sortable: true, cell: (row) => row.no },
		{ key: "grade", header: "Kelas", sortable: true, cell: (row) => cellText(row, "grade") },
		{ key: "levelName", header: "Jenjang", sortable: true, cell: (row) => row.levelName },
		{ key: "total", header: "Total Santri", sortable: true, cell: (row) => santri(row.total) },
		{ key: "active", header: "KBM Active", sortable: true, cell: (row) => santri(row.active) },
		{ key: "naikKelas", header: "Naik Kelas", sortable: true, cell: (row) => santri(row.naikKelas) },
		{ key: "tinggalKelas", header: "Tinggal Kelas", sortable: true, cell: (row) => santri(row.tinggalKelas) },
		{
			key: "action",
			header: "Actions",
			sortable: false,
			// `AcademicYearService::getAction()`
			cell: (row) => (
				<div>
					{row.grade !== null && row.levelId !== null ? (
						<Link
							to="/students/academic-years/$academicYearId/grades/$grade/levels/$levelId"
							params={{ academicYearId: String(academicYearId), grade: String(row.grade), levelId: String(row.levelId) }}
							className={ACTION_LINK_CLASS}
						>
							{DETAIL_ICON}
						</Link>
					) : null}{" "}
					<DestroyAction onClick={() => setPending(row)} />
				</div>
			),
		},
	]

	return (
		<>
			<LegacyDataTable
				columns={columns}
				rows={page.rows}
				rowKey={(row) => `${row.grade ?? ""}-${row.levelId ?? ""}`}
				total={page.total}
				state={state}
				onStateChange={setState}
				processing={isFetching}
				loaded={isSuccess}
				initialSort={{ key: "no", dir: "asc" }}
				minWidth="950px"
			/>
			<LegacyConfirmDelete open={pending !== null} onCancel={() => setPending(null)} onConfirm={confirm} loading={busy} />
		</>
	)
}

export default StudentGradeTable
