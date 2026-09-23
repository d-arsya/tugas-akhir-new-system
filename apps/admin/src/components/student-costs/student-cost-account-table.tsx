import { Fragment, useEffect, useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentCostAccountPage, StudentCostAccountRow } from "@roja/types"

import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { InfoCircleIcon } from "@/components/legacy/legacy-icons"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { INITIAL_TABLE_STATE, clientTable, type TableState } from "@/lib/legacy-table"

import StudentCostApplyButton from "./student-cost-apply-button"

type NumberedAccount = StudentCostAccountRow & { no: number }

// `paging: false` renders every row, so the page length only has to stay above the nine
// accountancies this table can hold. `legacy-data-table` still draws the length menu, which
// legacy drops entirely when paging is off (`_fnFeatureHtmlLength` returns null) — kit follow-up.
const ACCOUNT_TABLE_STATE: TableState = { ...INITIAL_TABLE_STATE, length: 100 }

const REMINDER_TOOLTIP = "Tagihan akan muncul pada admin dan santri sekian hari sebelum jatuh tempo"

/**
 * The searchable/sortable text of a cell.
 *
 * Columns 3, 4 and 6 carry a hidden `<span class="d-none">` numeric key in front of the visible
 * text so DataTables' `any-number` type sorts them by value rather than by the rupiah string.
 * That span is part of the cell's text content, so legacy searches it too — concatenating the
 * `*Sort` number in front of the display string reproduces both behaviours at once.
 */
const cellText = (row: NumberedAccount, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "name":
			return row.name ?? ""
		case "maximum":
			return `${row.maximumSort ?? ""}${row.maximumCost ?? "-"}`
		case "option":
			return `${row.optionSort ?? ""}${row.optionCosts.length > 0 ? row.optionCosts.join(",") : "-"}`
		case "period":
			return `${row.periodSort ?? ""}${row.periodLabel}`
		case "reminder":
			return `${row.reminderSort ?? ""}${row.reminderLabel}`
		case "dueDate":
			return row.dueDate
		case "note":
			return row.note
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "name", "maximum", "option", "period", "reminder", "dueDate", "note"]

// `student-cost-term/account.blade.php` + `student-cost/account-datatable.js`
const StudentCostAccountTable = ({ page: data }: { page: StudentCostAccountPage }): JSX.Element => {
	const [state, setState] = useState<TableState>(ACCOUNT_TABLE_STATE)
	// `checkboxBulkAction()` renders each row `checked` from its own `applied` flag
	const [checked, setChecked] = useState<number[]>([])

	useEffect(() => {
		setChecked(data.rows.flatMap((row) => (row.applied && row.termId !== null ? [row.termId] : [])))
	}, [data])

	const numbered = useMemo<NumberedAccount[]>(
		() => data.rows.map((row, index) => ({ ...row, no: index + 1 })),
		[data],
	)
	const shown = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])
	const selectable = useMemo(
		() => data.rows.flatMap((row) => (row.termId === null ? [] : [row.termId])),
		[data],
	)

	const toggle = (termId: number, next: boolean): void =>
		setChecked((current) => (next ? [...current, termId] : current.filter((id) => id !== termId)))

	const columns: LegacyColumn<NumberedAccount>[] = [
		{
			key: "check",
			width: "1%",
			sortable: false,
			header: (
				<LegacyCheckbox
					id="tbr_check_all_header"
					checked={selectable.length > 0 && checked.length === selectable.length}
					onChange={(next) => setChecked(next ? selectable : [])}
					label={null}
				/>
			),
			// An accountancy with no saved term gets no checkbox at all
			cell: (row) => {
				const termId = row.termId
				if (termId === null) return null
				return (
					<LegacyCheckbox
						id={`data_${row.no}`}
						name="checkbox-datatable"
						checked={checked.includes(termId)}
						onChange={(next) => toggle(termId, next)}
						label={null}
					/>
				)
			},
		},
		{ key: "no", header: "No", width: "5%", sortable: true, cell: (row) => row.no },
		{ key: "name", header: "Nama", sortable: true, cell: (row) => row.name },
		{
			key: "maximum",
			header: "Maximum",
			width: "10%",
			sortable: true,
			cell: (row) => row.maximumCost ?? "-",
		},
		{
			key: "option",
			header: "Option",
			width: "10%",
			sortable: true,
			// `implode('<br/>')`, with a trailing comma on every entry but the last
			cell: (row) =>
				row.optionCosts.length === 0
					? "-"
					: row.optionCosts.map((cost, index) => (
							<Fragment key={`${cost}-${index}`}>
								{index > 0 ? <br /> : null}
								{index === row.optionCosts.length - 1 ? cost : `${cost},`}
							</Fragment>
						)),
		},
		{ key: "period", header: "Siklus", width: "10%", sortable: true, cell: (row) => row.periodLabel },
		{
			key: "reminder",
			width: "10%",
			sortable: true,
			header: (
				<span className="inline-flex items-center">
					Pengingat
					<LegacyTooltip content={REMINDER_TOOLTIP} placement="top" className="ml-[4px] align-middle">
						<InfoCircleIcon />
					</LegacyTooltip>
				</span>
			),
			cell: (row) => row.reminderLabel,
		},
		{ key: "dueDate", header: "Jatuh Tempo", width: "15%", sortable: true, cell: (row) => row.dueDate },
		{ key: "note", header: "Keterangan", width: "15%", sortable: true, cell: (row) => row.note },
		{
			key: "actions",
			header: "Actions",
			width: "5%",
			sortable: false,
			// `actionAccount()` — the pencil points at edit when a term exists, at create otherwise
			cell: (row) => (
				<div className="text-center">
					<Link
						to={
							row.termId === null
								? "/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/create"
								: "/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/edit"
						}
						params={{
							academicYearId: String(data.academicYear.id),
							gradeId: String(data.grade.id),
							accountancyId: String(row.accountancyId),
						}}
						className="inline-block align-middle"
					>
						<img src="/assets/svg/icons/pencil.svg" alt="Detail" width={24} height={24} />
					</Link>
				</div>
			),
		},
	]

	return (
		<>
			<StudentCostApplyButton
				academicYearId={data.academicYear.id}
				gradeId={data.grade.id}
				ids={checked}
			/>
			<LegacyDataTable
				columns={columns}
				rows={shown.rows}
				rowKey={(row) => row.accountancyId}
				total={shown.total}
				state={state}
				onStateChange={setState}
				processing={false}
				loaded
				initialSort={{ key: "no", dir: "asc" }}
				minWidth="1500px"
				paging={false}
				frozenColumns={2}
				// `html tr.tbr_selected td { background-color: #F0F8F3 }` (app.css 3361)
				rowClassName={(row) =>
					row.termId !== null && checked.includes(row.termId) ? "[&>td]:bg-[#F0F8F3]" : undefined
				}
			/>
		</>
	)
}

export default StudentCostAccountTable
