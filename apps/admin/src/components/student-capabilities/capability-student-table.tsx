import { useEffect, useMemo, useState, type JSX } from "react"
import { Link, useRouter } from "@tanstack/react-router"

import type { CapabilityStudentRow } from "@roja/types"

import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import CapabilityHelpCreateModal from "@/components/student-capabilities/modals/capability-help-create-modal"
import { useStoreCapabilitySelection } from "@/hooks/use-student-capabilities"
import { useSubGrades } from "@/hooks/use-sub-grades"
import { legacyErrors } from "@/lib/legacy-errors"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { CAPABILITY_ACTION_CLASS, ListActionIcon } from "./capability-icons"
import {
	applyColumnFilters,
	selectionAction,
	STUDENT_SEARCH_KEYS,
	studentCellText,
	type CapabilityFilter,
	type NumberedStudent,
} from "./capability-student-filters"
import CapabilityStudentToolbar from "./capability-student-toolbar"

// `save-data-to-session.js:32` — `setTimeout(() => window.location = res.redirect, 1000)`
const REDIRECT_DELAY_MS = 1000

type CapabilityStudentTableProps = {
	academicYearId: number
	gradeId: number
	rows: CapabilityStudentRow[] | undefined
	loaded: boolean
	processing: boolean
}

/**
 * `capability.blade.php` + `capability-datatable.js` (`initDatatable(url, [0, 7])`, `order: [[1,'asc']]`)
 * + `capability-filter.js` + `bulk-action.js` + `save-data-to-session.js`.
 *
 * Kept as legacy:
 *  - the row checkboxes are hidden (`.custom-checkbox.d-none`) until a Kesanggupan filter is
 *    chosen, and changing that filter clears every tick (`resetAll()`);
 *  - the action posted is decided by the filter, not by the rows (`selectionAction`);
 *  - a santri with no capability at all paints the row `tbr_selected-danger` (#FDF4F5).
 *
 * Fixed: legacy collected the ticks with `$("[name='checkbox-datatable']:checked")`, which only
 * sees the rows of the page currently drawn — ticks on other pages stayed ticked on screen and were
 * silently left out of the post. The selection here spans every page.
 */
const CapabilityStudentTable = ({ academicYearId, gradeId, rows, loaded, processing }: CapabilityStudentTableProps): JSX.Element => {
	const router = useRouter()
	const { data: subGrades } = useSubGrades()
	const selection = useStoreCapabilitySelection(academicYearId, gradeId)

	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [filter, setFilter] = useState<CapabilityFilter>("")
	const [subGrade, setSubGrade] = useState("")
	const [selected, setSelected] = useState<Set<number>>(() => new Set())
	const [helpOpen, setHelpOpen] = useState(false)
	const [redirecting, setRedirecting] = useState(false)

	useEffect(() => {
		if (!redirecting || !selection.data) return undefined
		const target = selection.data.redirect
		const timer = window.setTimeout(() => router.history.push(target), REDIRECT_DELAY_MS)
		return () => window.clearTimeout(timer)
	}, [redirecting, selection.data, router])

	// `latest()` decides the order and the `$no` counter follows it
	const numbered = useMemo<NumberedStudent[]>(() => (rows ?? []).map((row, index) => ({ ...row, no: index + 1 })), [rows])
	const filtered = useMemo(() => applyColumnFilters(numbered, filter, subGrade), [numbered, filter, subGrade])
	const page = useMemo(() => clientTable(filtered, state, studentCellText, STUDENT_SEARCH_KEYS), [filtered, state])

	// `SubGrade::all()` in id order, after the blade's two fixed options
	const subGradeOptions = useMemo(
		() => [
			{ value: "", label: "Subkelas" },
			{ value: "undefined", label: "Undefined" },
			...[...(subGrades ?? [])]
				.sort((a, b) => a.id - b.id)
				.map((row) => ({ value: row.label ?? "", label: row.label ?? "" })),
		],
		[subGrades],
	)

	const showChecks = filter !== ""
	const pageIds = page.rows.map((row) => row.studentGradeId)
	const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

	const toggle = (ids: number[], on: boolean): void =>
		setSelected((current) => {
			const next = new Set(current)
			for (const id of ids) {
				if (on) next.add(id)
				else next.delete(id)
			}
			return next
		})

	const changeFilter = (next: CapabilityFilter): void => {
		setFilter(next)
		// `resetAll()` — every tick cleared, the button disabled again
		setSelected(new Set())
		setState((current) => ({ ...current, page: 1 }))
	}

	const submit = (): void => {
		selection.mutate(
			{ studentGradeIds: [...selected], action: selectionAction(filter) },
			{
				onSuccess: () => setRedirecting(true),
				onError: (error) => legacyNotify.error(legacyErrors(error)),
			},
		)
	}

	const columns: LegacyColumn<NumberedStudent>[] = [
		{
			key: "check",
			width: "1%",
			sortable: false,
			header: (
				<LegacyCheckbox
					id="tbr_check_all_header"
					checked={allOnPage}
					// `bulk-action.js:19-41` — ticks only the rows drawn, and only while they are visible
					onChange={(next) => (showChecks ? toggle(pageIds, next) : undefined)}
					label={null}
				/>
			),
			cell: (row) =>
				showChecks ? (
					<LegacyCheckbox
						id={`data_${row.no}`}
						name="checkbox-datatable"
						checked={selected.has(row.studentGradeId)}
						onChange={(next) => toggle([row.studentGradeId], next)}
						label={null}
					/>
				) : null,
		},
		{ key: "no", header: "No", width: "5%", sortable: true, cell: (row) => row.no },
		{ key: "nis", header: "NISP", sortable: true, cell: (row) => row.nis },
		{ key: "fullName", header: "Nama Lengkap", sortable: true, cell: (row) => row.fullName },
		{ key: "parentOrGuardian", header: "Ortu atau Wali", width: "15%", sortable: true, cell: (row) => row.parentOrGuardian },
		{ key: "subGrade", header: "Subkelas", width: "15%", sortable: true, cell: (row) => row.subGrade },
		{
			key: "capabilityCount",
			header: "Kesanggupan",
			width: "15%",
			sortable: true,
			// The hidden "Sudah|Belum memiliki kesanggupan" span is `hasCapability`; only the count shows
			cell: (row) => `${row.capabilityCount} Kesanggupan`,
		},
		{
			key: "action",
			header: "",
			width: "7%",
			sortable: false,
			cell: (row) => (
				// `StudentCapabilityService::getActionCapability()`
				<div>
					<Link
						to="/student-capabilities/students/$studentGradeId"
						params={{ studentGradeId: String(row.studentGradeId) }}
						className={CAPABILITY_ACTION_CLASS}
					>
						<ListActionIcon />
					</Link>
				</div>
			),
		},
	]

	return (
		<>
			<CapabilityStudentToolbar
				filter={filter}
				onFilterChange={changeFilter}
				subGrade={subGrade}
				subGradeOptions={subGradeOptions}
				onSubGradeChange={(value) => {
					setSubGrade(value)
					setState((current) => ({ ...current, page: 1 }))
				}}
				state={state}
				onStateChange={setState}
				canSubmit={selected.size > 0}
				submitting={selection.isPending || redirecting}
				onSubmit={submit}
				onHelp={() => setHelpOpen(true)}
			/>
			<LegacyDataTable
				columns={columns}
				rows={page.rows}
				rowKey={(row) => row.studentGradeId}
				total={page.total}
				state={state}
				onStateChange={setState}
				processing={processing}
				loaded={loaded}
				initialSort={{ key: "no", dir: "asc" }}
				minWidth="950px"
				toolbar={false}
				// `rowCallback` — `html tr.tbr_selected-danger td { background-color: #FDF4F5 }` (app.css 3365)
				rowClassName={(row) => (row.hasCapability ? undefined : "[&>td]:bg-[#FDF4F5]")}
			/>
			<CapabilityHelpCreateModal open={helpOpen} onClose={() => setHelpOpen(false)} />
		</>
	)
}

export default CapabilityStudentTable
