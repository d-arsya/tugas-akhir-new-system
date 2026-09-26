import type { JSX } from "react"

import type { CapabilityItemRow } from "@roja/types"

import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"
import { rupiahLabel } from "@/lib/legacy-format"

import type { MassDraft } from "./use-mass-draft"

const TABLE_STATE: TableState = { ...INITIAL_TABLE_STATE, length: 1000 }

const PencilIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" opacity="0.8">
		<path
			d="M19.4,7.34,16.66,4.6A2,2,0,0,0,14,4.53l-9,9a2,2,0,0,0-.57,1.21L4,18.91A1,1,0,0,0,5,20h.09l4.17-.38a2,2,0,0,0,1.21-.57l9-9a1.92,1.92,0,0,0-.07-2.71ZM9.08,17.62l-3,.28.27-3L12,9.32l2.7,2.7ZM16,10.68,13.32,8l1.95-2L18,8.73Z"
			fill="#e4007e"
		/>
	</svg>
)

type MassAccountTableProps = { draft: MassDraft; onEdit: (row: CapabilityItemRow) => void }

const MassAccountTable = ({ draft, onEdit }: MassAccountTableProps): JSX.Element => {
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

export default MassAccountTable
