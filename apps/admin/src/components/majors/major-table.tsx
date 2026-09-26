import { useMemo, useState, type JSX } from "react"

import type { MajorRow } from "@roja/types"

import LegacyConfirmDelete from "@/components/legacy/legacy-confirm-delete"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import AcademicRowActions from "@/components/academic/academic-row-actions"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useDeleteMajor, useMajors } from "@/hooks/use-majors"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

type NumberedMajor = MajorRow & { no: number }

const cellText = (row: NumberedMajor, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "name":
			return row.name ?? ""
		case "levelName":
			return row.levelName ?? ""
		case "desc":
			return row.desc ?? ""
		case "createdAt":
			return `${row.createdAtTs} ${row.createdAt}`
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "name", "levelName", "desc", "createdAt"]

type MajorTableProps = { onEdit: (id: number) => void }

const MajorTable = ({ onEdit }: MajorTableProps): JSX.Element => {
	const { data, isFetching, isSuccess } = useMajors()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [pending, setPending] = useState<MajorRow | null>(null)
	const deleteMajor = useDeleteMajor()

	const numbered = useMemo<NumberedMajor[]>(
		() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })),
		[data],
	)
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const remove = useLegacySubmit({
		mutationFn: (id: number) => deleteMajor.mutateAsync(id),
		onDone: () => setPending(null),
	})

	const columns: LegacyColumn<NumberedMajor>[] = [
		{ key: "no", header: "No", sortable: true, cell: (row) => row.no },
		{ key: "name", header: "Nama", sortable: true, cell: (row) => row.name },
		{ key: "levelName", header: "Jenjang", sortable: true, cell: (row) => row.levelName },
		{ key: "desc", header: "Keterangan", sortable: true, cell: (row) => row.desc },
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
			cell: (row) => <AcademicRowActions onEdit={() => onEdit(row.id)} onDelete={() => setPending(row)} />,
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

			<LegacyConfirmDelete
				open={pending !== null}
				onCancel={() => setPending(null)}
				onConfirm={() => {
					if (pending) remove.submit(pending.id)
				}}
				loading={remove.submitting}
			/>
		</>
	)
}

export default MajorTable
