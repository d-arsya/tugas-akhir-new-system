import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminAlumniYearRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { useAlumniYears } from "@/hooks/use-alumni"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

type NumberedYear = AdminAlumniYearRow & { no: number }

const cellText = (row: NumberedYear, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "year":
			return String(row.year)
		case "total":
			return String(row.total)
		case "male":
			return String(row.male)
		case "female":
			return String(row.female)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "year", "total", "male", "female"]

type AlumniYearTableProps = { onDelete: (year: number) => void }

const AlumniYearTable = ({ onDelete }: AlumniYearTableProps): JSX.Element => {
	const { data, isFetching, isSuccess } = useAlumniYears()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)

	const numbered = useMemo<NumberedYear[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedYear>[] = [
		{ key: "no", header: "No", sortable: true, cell: (row) => row.no },
		{ key: "year", header: "Tahun Kelulusan", sortable: true, cell: (row) => row.year },
		{ key: "total", header: "Jumlah Lulusan", sortable: true, cell: (row) => row.total },
		{ key: "male", header: "Laki - Laki", sortable: true, cell: (row) => row.male },
		{ key: "female", header: "Perempuan", sortable: true, cell: (row) => row.female },
		{
			key: "actions",
			header: "Actions",
			sortable: false,
			cell: (row) => (
				<div className="align-middle">
					<Link
						to="/alumni/graduation-year/$year"
						params={{ year: String(row.year) }}
						className="mr-[5px] inline-block align-middle"
					>
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} className="inline-block" />
					</Link>{" "}
					<button type="button" onClick={() => onDelete(row.year)} className="inline-block cursor-pointer align-middle">
						<img src="/assets/svg/icons/data_destroy.svg" alt="Destroy" width={24} height={24} className="inline-block" />
					</button>
				</div>
			),
		},
	]

	return (
		<LegacyDataTable
			columns={columns}
			rows={page.rows}
			rowKey={(row) => row.year}
			total={page.total}
			state={state}
			onStateChange={setState}
			processing={isFetching}
			loaded={isSuccess}
			initialSort={{ key: "no", dir: "asc" }}
			minWidth="750px"
		/>
	)
}

export default AlumniYearTable
