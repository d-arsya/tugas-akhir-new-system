import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentTransactionListRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyDateRange from "@/components/legacy/legacy-date-range"
import { useStudentTransactionTable, type TransactionDateRange } from "@/hooks/use-student-transactions"
import { formatIndoDate, rupiahLabel } from "@/lib/legacy-format"

// Legacy `student-transaction/index.blade.php` + `student-transaction-serverside.js`.
// Owned by WS P1-C.

type StudentTransactionTableProps = {
	range: TransactionDateRange
	onRangeChange: (range: TransactionDateRange) => void
}

/**
 * `student-transaction-serverside.js:85-95`, headers from `index.blade.php:70-80`.
 *
 * `DT_RowIndex` and `action` are `orderable: false` (`:86` and the `orderFalse` argument `[8]`
 * passed at `index.blade.php:105`); every other column sorts through `orderCol()`.
 */
const columns: LegacyColumn<StudentTransactionListRow>[] = [
	{ key: "no", header: "No", width: "7%", sortable: false, cell: (_row, index) => index },
	{
		key: "paidAt",
		header: "ID Pembayaran",
		width: "20%",
		sortable: true,
		// `:101` — an inline `color: #E4007E` with no weight change, then the grey timestamp
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
		// `:108` — `$transaction->grade .' '. $transaction->sub_grade`, always with the space
		cell: (row) => `${row.grade ?? ""} ${row.subGrade ?? ""}`,
	},
	{
		key: "action",
		header: "Actions",
		width: "5%",
		sortable: false,
		// `:113-119` — a bare `<div class="action">`, no flex and no centering, unlike the
		// Data Master tables' `.actions.d-flex.justify-content-center`
		cell: (row) => (
			<div>
				{/* `.modal-with-zoom-anim` is dead: magnific-popup is never initialised on this page */}
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
			{/*
			 * `index.blade.php:14-67` puts the length select, the date range and the search box in
			 * one `.row` because the DataTable hides its own `l` and `f` behind `<"d-none"lf>`
			 * (`student-transaction-serverside.js:21`). `LegacyDataTable` always renders its own
			 * toolbar and the kit is frozen, so the range sits in its own row above it — same
			 * `col-md-4` horizontal slot, one row higher. Reported to the lead.
			 */}
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

			{/* `<table … style="min-width: 1250px;">` */}
			<LegacyDataTable
				columns={columns}
				rows={table.rows}
				rowKey={(row) => row.id}
				total={table.total}
				state={table.state}
				onStateChange={table.setState}
				processing={table.processing}
				loaded={table.loaded}
				// `student-transaction-serverside.js:36` — `order: [[1, "desc"]]`, i.e. paid_at desc
				initialSort={{ key: "paidAt", dir: "desc" }}
				minWidth="1250px"
			/>
		</>
	)
}

export default StudentTransactionTable
