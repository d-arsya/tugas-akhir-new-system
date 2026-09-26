import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AccountancyRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyTreeCell from "@/components/legacy/legacy-tree-cell"
import { useAccountancies } from "@/hooks/use-accountancy"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import AccountancyEditModal from "./accountancy-edit-modal"

type NumberedAccountancy = AccountancyRow & { no: number }

const cellText = (row: NumberedAccountancy, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "name":
			return row.name ?? ""
		case "group":
			return row.groupLabel
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "name", "group"]

const DESTROY_TO = {
	delete: "/accountancy/$accountancyId/delete",
	"delegate-child": "/accountancy/$accountancyId/delegate-child",
} as const

const AccountancyTable = (): JSX.Element => {
	const { data, isFetching, isSuccess } = useAccountancies()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [editing, setEditing] = useState<number | null>(null)

	const numbered = useMemo<NumberedAccountancy[]>(
		() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })),
		[data],
	)
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedAccountancy>[] = [
		{ key: "no", header: "No", width: "5%", cell: (row) => row.no },
		{
			key: "name",
			header: "Nama",
			cell: (row) => (
				<LegacyTreeCell level={row.level}>{row.name}</LegacyTreeCell>
			),
		},
		{ key: "group", header: "Pengelompokan", width: "20%", cell: (row) => row.groupLabel },
		{
			key: "actions",
			header: "Actions",
			width: "15%",
			cell: (row) => (
				<div className="align-middle">
					<button
						type="button"
						className="mr-[5px] inline-block cursor-pointer align-middle"
						onClick={() => setEditing(row.id)}
					>
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
					</button>{" "}
					<Link
						to={DESTROY_TO[row.deleteTarget]}
						params={{ accountancyId: String(row.id) }}
						className="inline-block align-middle"
					>
						<img src="/assets/svg/icons/data_destroy.svg" alt="Destroy" width={24} height={24} />
					</Link>
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
				minWidth="625px"
			/>

			<AccountancyEditModal accountancyId={editing} onClose={() => setEditing(null)} />
		</>
	)
}

export default AccountancyTable
