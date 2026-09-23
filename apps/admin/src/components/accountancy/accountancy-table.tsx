import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AccountancyRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyTreeCell from "@/components/legacy/legacy-tree-cell"
import { useAccountancies } from "@/hooks/use-accountancy"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import AccountancyEditModal from "./accountancy-edit-modal"

// The row number is baked into the legacy payload (`$no++` over the flattened tree), so it keeps
// its value while the table is searched or paged — and the tree cannot be re-sorted anyway.
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

// `AccountancyService::getAction` picks the destroy href per row from `$account->childs->count()`
const DESTROY_TO = {
	delete: "/accountancy/$accountancyId/delete",
	"delegate-child": "/accountancy/$accountancyId/delegate-child",
} as const

/**
 * `accountancy/index.blade.php` right card, driven by `assets/js/account/datatable.js`.
 *
 * That file differs from every other DataTables bootstrapper in the app: it sets
 * **`ordering: false`** and drops `columnDefs` entirely, so the `[0,1,2,3]` argument the blade
 * passes is ignored and no column is sortable. That is load-bearing — the payload is a flattened
 * depth-first tree, and sorting any column would scatter the parents from their children.
 */
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
			// `AccountancyService::getName` — a Child.svg dash and a 15px gap from level 1, then
			// `35 + 40 * (level - 2)` px of extra indent from level 2
			cell: (row) => (
				<LegacyTreeCell level={row.level}>{row.name}</LegacyTreeCell>
			),
		},
		{ key: "group", header: "Pengelompokan", width: "20%", cell: (row) => row.groupLabel },
		{
			key: "actions",
			header: "Actions",
			width: "15%",
			// `.table .actions a` is inline-block with `margin-right: 5px`, plus the newline Blade
			// leaves between the two anchors — 5px + ~3.73px = the 8.73px legacy renders. The block
			// wrapper is load-bearing: a flex row would discard that whitespace-only text node.
			cell: (row) => (
				<div className="align-middle">
					<button
						type="button"
						className="mr-[5px] inline-block cursor-pointer align-middle"
						onClick={() => setEditing(row.id)}
					>
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
					</button>{" "}
					{/* Both destinations are full pages; `.modal-with-zoom-anim` is inert on this blade */}
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
			{/* `<table … style="min-width: 625px;">` */}
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
