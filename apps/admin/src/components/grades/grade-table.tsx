import { useMemo, useState, type JSX } from "react"

import type { GradeRow } from "@roja/types"

import LegacyConfirmDelete from "@/components/legacy/legacy-confirm-delete"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import AcademicRowActions from "@/components/academic/academic-row-actions"
import { useDeleteGrade, useGrades } from "@/hooks/use-grades"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

const DELETE_AFTER_MS = 500

type NumberedGrade = GradeRow & { no: number }

const cellText = (row: NumberedGrade, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "name":
			return row.name
		case "levelName":
			return row.levelName ?? ""
		case "createdAt":
			return `${row.createdAtTs} ${row.createdAt}`
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "name", "levelName", "createdAt"]

type GradeTableProps = { onEdit: (id: number) => void }

const GradeTable = ({ onEdit }: GradeTableProps): JSX.Element => {
	const { data, isFetching, isSuccess } = useGrades()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [pending, setPending] = useState<GradeRow | null>(null)
	const deleteGrade = useDeleteGrade()

	const numbered = useMemo<NumberedGrade[]>(
		() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })),
		[data],
	)
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const remove = useLegacySubmit({
		mutationFn: (id: number) => deleteGrade.mutateAsync(id),
		onDone: () => setPending(null),
		afterMs: DELETE_AFTER_MS,
	})

	const columns: LegacyColumn<NumberedGrade>[] = [
		{ key: "no", header: "No", sortable: true, cell: (row) => row.no },
		{ key: "name", header: "Nama", sortable: true, cell: (row) => row.name },
		{ key: "levelName", header: "Jenjang", sortable: true, cell: (row) => row.levelName },
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
				minWidth="700px"
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

export default GradeTable
