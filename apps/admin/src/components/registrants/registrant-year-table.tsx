import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminRegistrantAcademicYearRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import { useRegistrantYears } from "@/hooks/use-registrants"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

type NumberedYear = AdminRegistrantAcademicYearRow & { no: number }

const peserta = (count: number): string => `${count} Peserta`

const statusText = (row: AdminRegistrantAcademicYearRow): string =>
	row.status === "none" ? "-" : row.status === "open" ? "Dibuka" : "Ditutup"

const cellText = (row: NumberedYear, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "year":
			return row.year ?? ""
		case "total":
		case "reguler":
		case "indent":
		case "approve":
		case "reject":
			return peserta(row[key])
		case "status":
			return statusText(row)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "year", "total", "reguler", "indent", "approve", "reject", "status"]

const RegistrantYearTable = (): JSX.Element => {
	const { data, isFetching, isSuccess } = useRegistrantYears()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)

	const numbered = useMemo<NumberedYear[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const count = (key: "total" | "reguler" | "indent" | "approve" | "reject", header: string): LegacyColumn<NumberedYear> => ({
		key,
		header,
		sortable: true,
		cell: (row) => peserta(row[key]),
	})

	const columns: LegacyColumn<NumberedYear>[] = [
		{ key: "no", header: "No", sortable: false, cell: (row) => row.no },
		{ key: "year", header: "Tahun Ajaran", sortable: true, cell: (row) => row.year },
		count("total", "Total Pendaftar"),
		count("reguler", "Regular"),
		count("indent", "Indent"),
		count("approve", "Diterima"),
		count("reject", "Tidak Diterima"),
		{
			key: "status",
			header: "Status",
			sortable: true,
			cell: (row) =>
				row.status === "none" ? (
					"-"
				) : (
					<LegacyLabel variant={row.status === "open" ? "success" : "danger"}>{statusText(row)}</LegacyLabel>
				),
		},
		{
			key: "actions",
			header: "Actions",
			sortable: false,
			cell: (row) => (
				<div className="align-middle">
					<Link
						to="/registrants/academic-years/$academicYearId"
						params={{ academicYearId: String(row.id) }}
						className="inline-block align-middle"
					>
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} className="inline-block" />
					</Link>
				</div>
			),
		},
	]

	return (
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
			minWidth="950px"
		/>
	)
}

export default RegistrantYearTable
