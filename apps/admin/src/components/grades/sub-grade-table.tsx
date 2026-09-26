import { useMemo, useState, type JSX } from "react"

import type { SubGradeRow } from "@roja/types"

import LegacyConfirmDelete from "@/components/legacy/legacy-confirm-delete"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import AcademicRowActions from "@/components/academic/academic-row-actions"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useDeleteSubGrade, useSubGrades } from "@/hooks/use-sub-grades"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

const DELETE_AFTER_MS = 500

type NumberedSubGrade = SubGradeRow & { no: number }

const cellText = (row: NumberedSubGrade, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "label":
			return row.label ?? ""
		case "createdAt":
			return `${row.createdAtTs} ${row.createdAt}`
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "label", "createdAt"]

type SubGradeTableProps = { onEdit: (id: number) => void }

const SubGradeTable = ({ onEdit }: SubGradeTableProps): JSX.Element => {
	const { data, isFetching, isSuccess } = useSubGrades()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [pending, setPending] = useState<SubGradeRow | null>(null)
	const deleteSubGrade = useDeleteSubGrade()

	const numbered = useMemo<NumberedSubGrade[]>(
		() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })),
		[data],
	)
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const remove = useLegacySubmit({
		mutationFn: (id: number) => deleteSubGrade.mutateAsync(id),
		onDone: () => setPending(null),
		afterMs: DELETE_AFTER_MS,
	})

	const columns: LegacyColumn<NumberedSubGrade>[] = [
		{ key: "no", header: "No", sortable: true, cell: (row) => row.no },
		{ key: "label", header: "Label", sortable: true, cell: (row) => row.label },
		{
			key: "createdAt",
			header: "Dibuat pada",
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
				minWidth="510px"
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

export default SubGradeTable
