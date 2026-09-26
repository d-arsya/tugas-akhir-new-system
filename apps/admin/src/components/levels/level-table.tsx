import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { LevelRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import LevelEditModal from "@/components/levels/level-edit-modal"
import { useLevels } from "@/hooks/use-levels"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

type NumberedLevel = LevelRow & { no: number }

const statusText = (row: LevelRow): string => {
	if (row.status === "show") return "Ditampilkan"
	if (row.status === "hide") return "Tidak Ditampilkan"
	return ""
}

const cellText = (row: NumberedLevel, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "name":
			return row.name ?? ""
		case "status":
			return statusText(row)
		case "createdAt":
			return `${row.createdAtTs} ${row.createdAt}`
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "name", "status", "createdAt"]

const DESTROY_TO = {
	delete: "/levels/$levelId/delete",
	"delegate-major": "/levels/$levelId/delegate-major",
	"delegate-grade": "/levels/$levelId/delegate-grade",
	"delegate-registrant": "/levels/$levelId/delegate-registrant",
	"delegate-student": "/levels/$levelId/delegate-student",
} as const

const LevelTable = (): JSX.Element => {
	const { data, isFetching, isSuccess } = useLevels()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [editing, setEditing] = useState<number | null>(null)

	const numbered = useMemo<NumberedLevel[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedLevel>[] = [
		{ key: "no", header: "No", sortable: true, cell: (row) => row.no },
		{ key: "name", header: "Nama", sortable: true, cell: (row) => row.name },
		{
			key: "status",
			header: "Halaman PSB",
			sortable: true,
			cell: (row) =>
				row.status === null ? null : (
					<LegacyLabel
						variant={row.status === "show" ? "success" : "danger"}
						className={row.status === "hide" ? "truncate" : ""}
					>
						{statusText(row)}
					</LegacyLabel>
				),
		},
		{
			key: "createdAt",
			header: "Dibuat Pada",
			sortable: true,
			cell: (row) => (
				<div>
					<span className="hidden">{row.createdAtTs}</span> {row.createdAt}
				</div>
			),
		},
		{
			key: "actions",
			header: "Actions",
			sortable: false,
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
						params={{ levelId: String(row.id) }}
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
				initialSort={{ key: "no", dir: "asc" }}
				minWidth="750px"
			/>

			<LevelEditModal levelId={editing} onClose={() => setEditing(null)} />
		</>
	)
}

export default LevelTable
