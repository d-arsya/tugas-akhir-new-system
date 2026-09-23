import { useMemo, useState, type JSX } from "react"

import type { GradeRow } from "@roja/types"

import LegacyConfirmDelete from "@/components/legacy/legacy-confirm-delete"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import AcademicRowActions from "@/components/academic/academic-row-actions"
import { useDeleteGrade, useGrades } from "@/hooks/use-grades"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

// `grade/delete.js` closes the confirm popup 500 ms after the notice, not the usual 1000
const DELETE_AFTER_MS = 500

// The row number is baked into the legacy payload, so it keeps its value when the table is re-sorted
type NumberedGrade = GradeRow & { no: number }

// Legacy rendered this column with bare `formatDate()`, so it sorted alphabetically on the
// Indonesian date string (bug B-7). `createdAtTs` leads the cell text, as the other tables do.
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

// `grade/partials/grade.blade.php` table + `default-datatable2.js` / `grade/delete.js`
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
		// `"Kelas ".$grade->label`
		{ key: "name", header: "Nama", sortable: true, cell: (row) => row.name },
		// B-6: LEFT JOIN, so a grade whose level was deleted renders blank instead of 500ing
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
			// `initCustomDatatables(urlGrade, [4], ".grade")`
			sortable: false,
			cell: (row) => <AcademicRowActions onEdit={() => onEdit(row.id)} onDelete={() => setPending(row)} />,
		},
	]

	return (
		<>
			{/* `<table class="table tbr_table grade mb-0" style="min-width: 700px;">` */}
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
