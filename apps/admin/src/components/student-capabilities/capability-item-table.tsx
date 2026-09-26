import { useEffect, useMemo, useState, type JSX } from "react"

import type { CapabilityItemRow } from "@roja/types"
import { cn } from "@roja/utils"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import CapabilityAmountModal from "@/components/student-capabilities/modals/capability-amount-modal"
import { rupiahDots, rupiahLabel } from "@/lib/legacy-format"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

type NumberedItem = CapabilityItemRow & { no: number }

const cellText = (row: NumberedItem, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "name":
			return row.name ?? ""
		case "amount":
			return row.amount === null ? "" : rupiahLabel(row.amount)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "name", "amount"]

export type CapabilityItemSave = { note: string; items: { accountancyId: number; amount: string }[] }

type CapabilityItemTableProps = {
	rows: CapabilityItemRow[] | undefined
	loaded: boolean
	processing: boolean
	editable: boolean
	note: string | null
	saving: boolean
	onSave: (payload: CapabilityItemSave) => void
	onSelectionChange: (count: number, payload: CapabilityItemSave) => void
}

const CapabilityItemTable = ({
	rows,
	loaded,
	processing,
	editable,
	note,
	saving,
	onSave,
	onSelectionChange,
}: CapabilityItemTableProps): JSX.Element => {
	const [draft, setDraft] = useState<NumberedItem[]>([])
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [noteText, setNoteText] = useState(note ?? "")
	const [editing, setEditing] = useState<NumberedItem | null>(null)

	useEffect(() => setDraft((rows ?? []).map((row, index) => ({ ...row, no: index + 1 }))), [rows])
	useEffect(() => setNoteText(note ?? ""), [note])

	const page = useMemo(() => clientTable(draft, state, cellText, SEARCH_KEYS), [draft, state])
	const pageNos = page.rows.map((row) => row.no)

	const update = (nos: number[], patch: Partial<CapabilityItemRow>): void =>
		setDraft((current) => current.map((row) => (nos.includes(row.no) ? { ...row, ...patch } : row)))

	const ticked = draft.filter((row) => row.selected)
	const canSave = ticked.length > 0 && ticked.every((row) => row.amount !== null)

	const payload: CapabilityItemSave = {
		note: noteText,
		items: ticked.map((row) => ({ accountancyId: row.accountancyId, amount: rupiahDots(row.amount ?? 0) })),
	}
	const payloadKey = JSON.stringify(payload)
	useEffect(() => onSelectionChange(ticked.length, JSON.parse(payloadKey) as CapabilityItemSave), [payloadKey]) // eslint-disable-line react-hooks/exhaustive-deps

	const save = (): void => onSave(payload)

	const columns: LegacyColumn<NumberedItem>[] = [
		{
			key: "check",
			width: "1%",
			sortable: false,
			header: (
				<LegacyCheckbox
					id="tbr_check_all_header"
					checked={editable && page.rows.length > 0 && page.rows.every((row) => row.selected)}
					onChange={(next) => (editable ? update(pageNos, { selected: next }) : undefined)}
					label={null}
				/>
			),
			cell: (row) =>
				editable ? (
					<LegacyCheckbox
						id={`data_${row.no}`}
						name="checkbox-datatable"
						checked={row.selected}
						onChange={(next) => update([row.no], { selected: next })}
						label={null}
					/>
				) : null,
		},
		{ key: "no", header: "No", width: "4%", sortable: true, cell: (row) => row.no },
		{ key: "name", header: "Nama", sortable: true, cell: (row) => row.name },
		{
			key: "amount",
			header: "Kesanggupan",
			sortable: true,
			cell: (row) => (row.amount === null ? null : rupiahLabel(row.amount)),
		},
		{
			key: "action",
			header: "Actions",
			width: "7%",
			sortable: false,
			cell: (row) => (
				<div className={cn("ml-[4px] pl-[8px]", !editable && "pointer-events-none opacity-50")}>
					<button type="button" onClick={() => setEditing(row)} className="inline-block cursor-pointer">
						<img src="/assets/svg/icons/pencil.svg" alt="" width={24} height={24} className="inline align-middle" />
					</button>
				</div>
			),
		},
	]

	return (
		<>
			<LegacyDataTable
				columns={columns}
				rows={page.rows}
				rowKey={(row) => row.costTermId}
				total={page.total}
				state={state}
				onStateChange={setState}
				processing={processing}
				loaded={loaded}
				initialSort={{ key: "no", dir: "asc" }}
				minWidth="725px"
			/>

			<div className="mt-[24px] mb-[16px]">
				<LegacyTextarea
					value={noteText}
					onChange={(event) => setNoteText(event.target.value)}
					placeholder="Tambahkan catatan jika diperlukan"
					rows={4}
					readOnly={!editable}
				/>
			</div>
			{editable ? (
				<div className="mt-[8px] text-right">
					<LegacyButton
						variant="primary"
						loading={saving}
						onClick={save}
						className={cn(!canSave && "pointer-events-none opacity-50")}
					>
						Simpan
					</LegacyButton>
				</div>
			) : null}

			<CapabilityAmountModal
				open={editing !== null}
				name={editing?.name ?? null}
				periodLabel={editing?.periodLabel ?? "Bulanan"}
				type={editing?.type ?? "maximum"}
				max={editing?.maxAmount ?? null}
				step={editing?.step ?? 5000}
				value={editing?.amount ?? null}
				options={editing?.options ?? []}
				onClose={() => setEditing(null)}
				onSave={(amount) => {
					if (editing) update([editing.no], { amount })
					setEditing(null)
				}}
			/>
		</>
	)
}

export default CapabilityItemTable
