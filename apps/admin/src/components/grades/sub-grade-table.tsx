import { useMemo, useState, type JSX } from "react"

import type { SubGradeRow } from "@roja/types"

import LegacyConfirmDelete from "@/components/legacy/legacy-confirm-delete"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import AcademicRowActions from "@/components/academic/academic-row-actions"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useDeleteSubGrade, useSubGrades } from "@/hooks/use-sub-grades"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

// `grade/delete.js` closes the confirm popup 500 ms after the notice, not the usual 1000
const DELETE_AFTER_MS = 500

// The row number is baked into the legacy payload, so it keeps its value when the table is re-sorted
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

// `grade/partials/subgrade.blade.php` table + `default-datatable2.js` / `grade/delete.js`
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
			// Lowercase "pada" here; every other table in this menu writes "Dibuat Pada"
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
			// `initCustomDatatables(urlSubGrade, [3], ".sub-grade")`
			sortable: false,
			cell: (row) => <AcademicRowActions onEdit={() => onEdit(row.id)} onDelete={() => setPending(row)} />,
		},
	]

	return (
		<>
			{/* `<table class="table tbr_table level mb-0 sub-grade" style="min-width: 510px;">` */}
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
