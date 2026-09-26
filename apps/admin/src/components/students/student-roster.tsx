import { useEffect, useMemo, useRef, useState, type JSX } from "react"

import type { AdminStudentRosterPage } from "@roja/types"

import LegacyConfirmDelete from "@/components/legacy/legacy-confirm-delete"
import LegacyDataTable from "@/components/legacy/legacy-data-table"
import LegacyInput from "@/components/legacy/legacy-input"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacySelect from "@/components/legacy/legacy-select"
import { useSocietySettings } from "@/hooks/use-society-settings"
import { useStudentDelete, useStudentRoster } from "@/hooks/use-students"
import { legacyErrors } from "@/lib/legacy-errors"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import StudentBulk from "./student-bulk"
import { kbmNoteText } from "./student-kbm-status"
import type { ListedStudent } from "./student-listing-modal"
import { ROSTER_SEARCH_KEYS, rosterCellText, rosterColumns, type NumberedStudent } from "./student-roster-columns"
import StudentRosterHeader from "./student-roster-header"

// Legacy `student/student.blade.php` card: bulk actions, `datatable-tools` (Show / Subkelas filter / Search),
// the table (`student-datatable.js`, `order: [[1, "asc"]]`, not sortable: [0, 11]) and the delete popup
// (`default-delete.js`). Every draw unticks every row (`resetAllcheckbox`).

const LENGTH_OPTIONS = ["10", "25", "50", "100"].map((value) => ({ value, label: value }))
// `default-delete.js`: the popup closes 1000 ms after the answer
const CLOSE_AFTER_MS = 1000

/** `parseStatusData()` — the label text of the Keterangan cell, kept only for Naik Kelas / Keluar. */
const listStatus = (row: NumberedStudent): string | null => {
	const text = kbmNoteText(row.gradeNote)
	return text === "Naik Kelas" || text === "Keluar" ? text : null
}

const StudentRoster = ({ page }: { page: AdminStudentRosterPage }): JSX.Element => {
	const { academicYear, grade, levelId } = page
	const { data, isFetching, isSuccess } = useStudentRoster(academicYear.id, grade, levelId)
	const { data: settings } = useSocietySettings()
	const remove = useStudentDelete()

	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [subGradeFilter, setSubGradeFilter] = useState("")
	const [checked, setChecked] = useState<ReadonlySet<number>>(new Set())
	const [pending, setPending] = useState<NumberedStudent | null>(null)
	const [busy, setBusy] = useState(false)
	const timer = useRef<number | undefined>(undefined)

	const numbered = useMemo<NumberedStudent[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	// `InitDatatable.column(8).search(value)` — a smart search on the Subkelas cell's text
	const filtered = useMemo(() => {
		const needle = subGradeFilter.trim().toLowerCase()
		return needle === "" ? numbered : numbered.filter((row) => (row.subGrade ?? "").toLowerCase().includes(needle))
	}, [numbered, subGradeFilter])
	const view = useMemo(() => clientTable(filtered, state, rosterCellText, ROSTER_SEARCH_KEYS), [filtered, state])

	// A redraw (page, sort, search, filter, reload) unticks every row
	useEffect(() => setChecked(new Set()), [state, subGradeFilter, data])
	useEffect(() => () => window.clearTimeout(timer.current), [])

	const visibleIds = view.rows.map((row) => row.id)
	const allChecked = visibleIds.length > 0 && visibleIds.every((id) => checked.has(id))
	const selected: ListedStudent[] = view.rows
		.filter((row) => checked.has(row.id))
		.map((row) => ({ id: row.id, name: row.fullname, nis: row.nis, status: listStatus(row) }))

	const toggle = (id: number, value: boolean): void =>
		setChecked((current) => {
			const next = new Set(current)
			if (value) next.add(id)
			else next.delete(id)
			return next
		})

	const confirmDelete = (): void => {
		if (!pending || busy) return
		setBusy(true)
		remove
			.mutateAsync(pending.id)
			.then((result) => legacyNotify.success(result.message))
			.catch((error: unknown) => legacyNotify.error(legacyErrors(error)))
			.finally(() => {
				timer.current = window.setTimeout(() => {
					setBusy(false)
					setPending(null)
				}, CLOSE_AFTER_MS)
			})
	}

	const columns = rosterColumns({
		settings: settings ?? [],
		checked,
		allChecked,
		onToggle: toggle,
		onToggleAll: (value) => setChecked(value ? new Set(visibleIds) : new Set()),
		onDelete: setPending,
	})

	return (
		<div className="relative flex min-w-0 flex-col border-0 bg-transparent shadow-none">
			<StudentRosterHeader
				academicYearId={academicYear.id}
				year={academicYear.year}
				grade={grade}
				levelId={levelId}
				levelName={page.levelName}
				count={numbered.length}
			/>
			{/* `.card-body.overflow-hidden.tbr_table_container.p-4` */}
			<div className="z-[1] min-h-px flex-auto overflow-hidden rounded-b-[12px] bg-[var(--bg-secondary)] p-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
				<StudentBulk
					selected={selected}
					isMaxGrade={page.maxGrade === grade}
					majors={page.majors}
					subGrades={page.subGrades}
					onDone={() => setChecked(new Set())}
				/>

				{/* `datatable-tools.blade.php` */}
				<div className="mx-[-15px] mb-[4px] flex flex-wrap justify-center">
					<div className="w-full px-[15px] md:w-1/4">
						<div className="mx-auto mb-[8px] w-[75px] max-w-[75px] min-w-[75px] md:ml-0">
							<LegacySelect
								value={String(state.length)}
								options={LENGTH_OPTIONS}
								searchable={false}
								onChange={(value) => setState({ ...state, length: Number(value), page: 1 })}
							/>
						</div>
					</div>
					<div className="w-full px-[15px] md:w-1/4" />
					<div className="w-full px-[15px] md:w-1/4">
						<div className="mb-[8px]">
							<LegacySelect
								value={subGradeFilter}
								options={[
									{ value: "", label: "Semua Subkelas" },
									{ value: "undefined", label: "Undefined" },
									...page.subGrades.map((label) => ({ value: label, label })),
								]}
								mutedText={subGradeFilter === ""}
								onChange={(value) => {
									setSubGradeFilter(value)
									setState({ ...state, page: 1 })
								}}
							/>
						</div>
					</div>
					<div className="w-full px-[15px] md:w-1/4">
						<div className="mb-[8px]">
							<LegacyInput
								value={state.search}
								placeholder="Search"
								spellCheck={false}
								onChange={(event) => setState({ ...state, search: event.target.value, page: 1 })}
							/>
						</div>
					</div>
				</div>

				{/* `.tbr_student_table` (app.css 2561-2578): 6px row padding, no sort arrows on the check column */}
				<div className="[&_td]:pt-[6px]! [&_td]:pb-[6px]! [&_th:first-child]:pr-0! [&_th:first-child]:before:hidden! [&_th:first-child]:after:hidden! [&_td:nth-child(2)]:pl-0! [&_th:nth-child(2)]:pl-0!">
					<LegacyDataTable
						columns={columns}
						rows={view.rows}
						rowKey={(row) => row.id}
						total={view.total}
						state={state}
						onStateChange={setState}
						processing={isFetching}
						loaded={isSuccess}
						initialSort={{ key: "no", dir: "asc" }}
						minWidth="1450px"
						toolbar={false}
					/>
				</div>
			</div>

			<LegacyConfirmDelete open={pending !== null} onCancel={() => setPending(null)} onConfirm={confirmDelete} loading={busy} />
		</div>
	)
}

export default StudentRoster
