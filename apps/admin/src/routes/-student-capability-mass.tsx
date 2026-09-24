import { useEffect, useMemo, useState, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { CapabilityItemInput, CapabilityItemRow } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"
import { legacyErrors } from "@/lib/legacy-errors"
import { rupiahLabel } from "@/lib/legacy-format"

// Shared by `mass-create.tsx` and `mass-edit.tsx`, which legacy also keeps as two near-identical
// blades. The `-` prefix is TanStack Router's `routeFileIgnorePrefix`, so this file is excluded
// from route generation and `routeTree.gen.ts` is untouched.

// `paging: false, ordering: false, info: false, searching: false` — `initDatatable()` in
// `mass-create-datatable.js` turns every DataTables feature off, so the table is just a table.
const TABLE_STATE: TableState = { ...INITIAL_TABLE_STATE, length: 1000 }

export type MassDraft = {
	rows: CapabilityItemRow[]
	checked: Set<number>
	amounts: Map<number, number | null>
	allChecked: boolean
	toggle: (costTermId: number, next: boolean) => void
	toggleAll: (next: boolean) => void
	editing: CapabilityItemRow | null
	openEditor: (row: CapabilityItemRow) => void
	closeEditor: () => void
	saveAmount: (amount: number | null) => void
	saveDisabled: boolean
	/** The checked rows, paired `{accountancyId, amount}` — legacy's `account_id[]` filtered by `data-row`. */
	payload: CapabilityItemInput[]
	/** Every row the form displayed, checked or not — legacy's unfiltered `showed_id[]`. */
	shownAccountancyIds: number[]
}

/**
 * The checkbox + amount state both mass pages carry.
 *
 * `saveDisabled` reproduces two different legacy rules that hand over to each other:
 *  * on load, `mass-create.blade.php:88` renders the button `tbr_disabled` when **any** listed
 *    term is `type='option'` (mass-edit has no such attribute, hence `initialDisabled`);
 *  * from the first interaction onwards, `isCapabilityContainEmptyValue()` in
 *    `mass-create-bulk-action.js` disables it when nothing is ticked **or** any ticked row's
 *    amount cell is empty. That function is never called on load, which is why the two rules
 *    differ at all.
 */
export const useMassDraft = (rows: CapabilityItemRow[] | undefined, initialDisabled = false): MassDraft => {
	const data = useMemo(() => rows ?? [], [rows])
	const [checked, setChecked] = useState<Set<number>>(new Set())
	const [amounts, setAmounts] = useState<Map<number, number | null>>(new Map())
	const [editing, setEditing] = useState<CapabilityItemRow | null>(null)
	const [touched, setTouched] = useState(false)

	useEffect(() => {
		setChecked(new Set(data.filter((row) => row.selected).map((row) => row.costTermId)))
		setAmounts(new Map(data.map((row) => [row.costTermId, row.amount])))
		setTouched(false)
	}, [data])

	const amountOf = (row: CapabilityItemRow): number | null => amounts.get(row.costTermId) ?? row.amount
	const checkedRows = data.filter((row) => checked.has(row.costTermId))

	const liveDisabled = checkedRows.length === 0 || checkedRows.some((row) => amountOf(row) === null)

	return {
		rows: data,
		checked,
		amounts,
		allChecked: data.length > 0 && checked.size === data.length,
		toggle: (costTermId, next) => {
			setTouched(true)
			setChecked((current) => {
				const updated = new Set(current)
				if (next) updated.add(costTermId)
				else updated.delete(costTermId)
				return updated
			})
		},
		toggleAll: (next) => {
			setTouched(true)
			setChecked(next ? new Set(data.map((row) => row.costTermId)) : new Set())
		},
		editing,
		openEditor: setEditing,
		closeEditor: () => setEditing(null),
		saveAmount: (amount) => {
			setTouched(true)
			if (editing !== null) setAmounts((current) => new Map(current).set(editing.costTermId, amount))
			setEditing(null)
		},
		saveDisabled: touched ? liveDisabled : initialDisabled || liveDisabled,
		payload: checkedRows.map((row) => ({
			accountancyId: row.accountancyId,
			// The form holds the masked text; `""` on an unpicked `option` row is what legacy's
			// `ArrayCannotContainNullRule` rejected with "Semua kesanggupan wajib untuk dipilih."
			amount: amountOf(row) === null ? "" : String(amountOf(row)),
		})),
		shownAccountancyIds: data.map((row) => row.accountancyId),
	}
}

/**
 * A selection the server rejects (another grade's santri, a stale tab, a hand-edited URL) sends the
 * operator back to the santri list with the server's message, the same place legacy's
 * `massCreate`/`massEdit` send an empty session. Without this the page would sit on
 * "Santri yang dipilih (0)" and an empty table.
 */
export const useRejectedSelection = (error: unknown, backTo: string): void => {
	const navigate = useNavigate()
	useEffect(() => {
		if (error === null || error === undefined) return
		legacyNotify.error(legacyErrors(error))
		void navigate({ to: backTo, replace: true })
	}, [error, backTo, navigate])
}

/** `assets/svg/icons/pencil.svg`, the only action on either mass table. */
const PencilIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" opacity="0.8">
		<path
			d="M19.4,7.34,16.66,4.6A2,2,0,0,0,14,4.53l-9,9a2,2,0,0,0-.57,1.21L4,18.91A1,1,0,0,0,5,20h.09l4.17-.38a2,2,0,0,0,1.21-.57l9-9a1.92,1.92,0,0,0-.07-2.71ZM9.08,17.62l-3,.28.27-3L12,9.32l2.7,2.7ZM16,10.68,13.32,8l1.95-2L18,8.73Z"
			fill="#e4007e"
		/>
	</svg>
)

/**
 * The five-column account table both mass pages render.
 *
 * Column 3 is deliberately empty when the row has no single master amount — legacy's
 * `rupiah(null)` returns **null** and the DataTables cell renders blank, which is exactly the
 * state `isCapabilityContainEmptyValue()` looks for.
 */
export const MassAccountTable = ({ draft, onEdit }: { draft: MassDraft; onEdit: (row: CapabilityItemRow) => void }): JSX.Element => {
	const columns: LegacyColumn<CapabilityItemRow>[] = [
		{
			key: "check",
			width: "1%",
			sortable: false,
			header: (
				<LegacyCheckbox
					id="tbr_check_all_header"
					checked={draft.allChecked}
					onChange={draft.toggleAll}
					label={null}
				/>
			),
			cell: (row) => (
				<LegacyCheckbox
					id={`data_${row.costTermId}`}
					name="checkbox-datatable"
					checked={draft.checked.has(row.costTermId)}
					onChange={(next) => draft.toggle(row.costTermId, next)}
					label={null}
				/>
			),
		},
		{ key: "no", width: "4%", sortable: false, header: "No", cell: (_row, index) => index },
		{ key: "name", width: "20%", sortable: false, header: "Nama", cell: (row) => row.name },
		{
			key: "amount",
			width: "20%",
			sortable: false,
			header: "Kesanggupan",
			cell: (row) => {
				const amount = draft.amounts.get(row.costTermId) ?? row.amount
				return amount === null ? null : rupiahLabel(amount)
			},
		},
		{
			key: "actions",
			width: "5%",
			sortable: false,
			header: "Actions",
			cell: (row) => (
				// `.pl-2.ml-1.tbr_action > a` — `openEditAmountModal($index)`
				<div className="ml-[4px] pl-[8px]">
					<button type="button" aria-label="Edit item kesanggupan" onClick={() => onEdit(row)} className="cursor-pointer">
						<PencilIcon />
					</button>
				</div>
			),
		},
	]

	return (
		<LegacyDataTable
			columns={columns}
			rows={draft.rows}
			rowKey={(row) => row.costTermId}
			total={draft.rows.length}
			state={TABLE_STATE}
			onStateChange={() => undefined}
			processing={false}
			loaded
			paging={false}
			toolbar={false}
			minWidth="auto"
		/>
	)
}

/** `assets/svg/icons/Dropdown-Arrow.svg`, rotated 180° while the panel is open. */
const DropdownArrow = ({ open }: { open: boolean }): JSX.Element => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		aria-hidden="true"
		className={`transition-transform duration-300 ease-[cubic-bezier(0.785,0.135,0.15,0.86)] ${open ? "rotate-180" : ""}`}
	>
		<path
			d="M12,16a1,1,0,0,1-.64-.23l-6-5A1,1,0,0,1,6.64,9.23L12,13.71l5.36-4.32A1.025,1.025,0,1,1,18.63,11l-6,4.83A1,1,0,0,1,12,16Z"
			fill="#ffa800"
		/>
	</svg>
)

type SelectedStudent = { studentGradeId: number; nis: string | null; fullName: string | null }

/** `.card.tbr_card.tbr_cost_cycle` — "Santri yang dipilih (N)" over a bootstrap `.collapse`. */
export const MassSelectionCard = ({ students }: { students: SelectedStudent[] }): JSX.Element => {
	const [open, setOpen] = useState(false)

	return (
		// `.tbr_cost_cycle .card-body { padding: 25px }`
		<LegacyCard bodyClassName="p-[25px]">
			<div className="relative">
				<div className="mb-[8px] mt-[2px] inline-block text-[16px] font-bold">
					Santri yang dipilih
					<span className="pl-[4px] text-[var(--primary)]">({students.length})</span>
				</div>
				<p className="mb-0">
					Lihat santri yang sudah dipilih{" "}
					<button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="cursor-pointer align-middle">
						<DropdownArrow open={open} />
					</button>
				</p>
			</div>
			{open ? (
				<LegacyCard bodyClassName="p-[24px]">
					{students.map((student, index) => (
						// `.d-flex.ml-2` — index, name, then the NISP in brackets
						<div key={student.studentGradeId} className="ml-[8px] flex">
							<div className="mr-[24px]">{index + 1}</div>
							<div className="mr-[8px]">{student.fullName}</div>
							<div className="mr-[8px]">({student.nis})</div>
						</div>
					))}
				</LegacyCard>
			) : null}
		</LegacyCard>
	)
}
