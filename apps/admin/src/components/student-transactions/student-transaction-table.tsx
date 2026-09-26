import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentTransactionListRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyDateRange from "@/components/legacy/legacy-date-range"
import { useStudentTransactionTable, type TransactionDateRange } from "@/hooks/use-student-transactions"
import { formatIndoDate, rupiahLabel } from "@/lib/legacy-format"

type StudentTransactionTableProps = {
	range: TransactionDateRange
	onRangeChange: (range: TransactionDateRange) => void
}

const columns: LegacyColumn<StudentTransactionListRow>[] = [
	{ key: "no", header: "No", width: "7%", sortable: false, cell: (_row, index) => index },
	{
		key: "paidAt",
		header: "ID Pembayaran",
		width: "20%",
		sortable: true,
		cell: (row) => (
			<>
				<div style={{ color: "#E4007E" }}>{row.transactionCode}</div>
				<div className="text-[var(--grey)]">{formatIndoDate(row.paidAt, true)}</div>
			</>
		),
	},
	{ key: "amount", header: "Nominal", width: "10%", sortable: true, cell: (row) => rupiahLabel(row.amount) },
	{ key: "itemCount", header: "Item", width: "5%", sortable: true, cell: (row) => row.itemCount },
	{ key: "description", header: "Keterangan", width: "15%", sortable: true, cell: (row) => row.description },
	{ key: "nis", header: "NISP", width: "13%", sortable: true, cell: (row) => row.nis },
	{ key: "fullName", header: "Atas Nama", width: "20%", sortable: true, cell: (row) => row.fullName },
	{
		key: "grade",
		header: "Kelas",
		width: "10%",
		sortable: true,
		cell: (row) => `${row.grade ?? ""} ${row.subGrade ?? ""}`,
	},
	{
		key: "action",
		header: "Actions",
		width: "5%",
		sortable: false,
		cell: (row) => (
			<div>
				<Link
					to="/student-transactions/$transactionId"
					params={{ transactionId: String(row.id) }}
					className="whitespace-normal"
				>
					<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
				</Link>
			</div>
		),
	},
]

const StudentTransactionTable = ({ range, onRangeChange }: StudentTransactionTableProps): JSX.Element => {
	const table = useStudentTransactionTable(range)

	return (
		<>
			<div className="mx-[-15px] mb-[8px] flex flex-wrap">
				<div className="w-full px-[15px] min-[768px]:w-2/12" />
				<div className="w-full px-[15px] min-[768px]:w-3/12" />
				<div className="w-full px-[15px] min-[768px]:w-4/12">
					<div className="mb-[8px]">
						<LegacyDateRange
							from={range.from}
							to={range.to}
							onChange={(from, to) => onRangeChange({ from, to })}
							middleLabel="Sampai"
						/>
					</div>
				</div>
				<div className="w-full px-[15px] min-[768px]:w-3/12" />
			</div>

			<LegacyDataTable
				columns={columns}
				rows={table.rows}
				rowKey={(row) => row.id}
				total={table.total}
				state={table.state}
				onStateChange={table.setState}
				processing={table.processing}
				loaded={table.loaded}
				initialSort={{ key: "paidAt", dir: "desc" }}
				minWidth="1250px"
			/>
		</>
	)
}

export default StudentTransactionTable
