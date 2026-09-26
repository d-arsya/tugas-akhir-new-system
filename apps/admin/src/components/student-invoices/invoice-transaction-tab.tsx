import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { InvoiceTransactionRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"
import { formatIndoDate, rupiahLabel } from "@/lib/legacy-format"

type NumberedTransaction = InvoiceTransactionRow & { no: number }

const cellText = (row: NumberedTransaction, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "code":
			return `${row.transactionCode ?? ""} ${formatIndoDate(row.paidAt, true)}`
		case "amount":
			return String(row.amount)
		case "itemCount":
			return String(row.itemCount)
		case "description":
			return row.description ?? ""
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "code", "amount", "itemCount", "description"]

type InvoiceTransactionTabProps = {
	rows: InvoiceTransactionRow[]
	loaded: boolean
	processing: boolean
	variant: "payments" | "cancelled"
	onCancel?: (row: InvoiceTransactionRow) => void
}

const InvoiceTransactionTab = ({ rows, loaded, processing, variant, onCancel }: InvoiceTransactionTabProps): JSX.Element => {
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)

	const numbered = useMemo<NumberedTransaction[]>(() => rows.map((row, index) => ({ ...row, no: index + 1 })), [rows])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedTransaction>[] = [
		{ key: "no", header: "No", width: "5%", sortable: true, cell: (row) => row.no },
		{
			key: "code",
			header: "ID Pembayaran",
			sortable: true,
			cell: (row) => (
				<>
					<span className="text-[var(--primary)]">{row.transactionCode}</span> <br />{" "}
					<span className="text-[var(--grey)]">{formatIndoDate(row.paidAt, true)}</span>
				</>
			),
		},
		{ key: "amount", header: "Nominal", sortable: true, cell: (row) => rupiahLabel(row.amount) },
		{ key: "itemCount", header: "Item", sortable: true, cell: (row) => row.itemCount },
		{ key: "description", header: "Keterangan", sortable: true, cell: (row) => row.description },
		{
			key: "action",
			header: "Actions",
			width: "7%",
			cell: (row) => (
				<div>
					{variant === "cancelled" ? (
						<>
							<LegacyTooltip content={row.cancelNote ?? ""} placement="left" className="align-middle">
								<img src="/assets/svg/icons/data_note.svg" alt="Detail" width={24} height={24} />
							</LegacyTooltip>{" "}
						</>
					) : null}
					<Link
						to="/student-invoices/transactions/$transactionId"
						params={{ transactionId: String(row.id) }}
						className="inline-block align-middle"
					>
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
					</Link>
					{variant === "payments" ? (
						<>
							{" "}
							<button
								type="button"
								aria-label="Batalkan pembayaran"
								onClick={() => onCancel?.(row)}
								className="inline-block cursor-pointer align-middle"
							>
								<img src="/assets/svg/icons/data_cross.svg" alt="Destroy" width={24} height={24} />
							</button>
						</>
					) : null}
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
			processing={processing}
			loaded={loaded}
			initialSort={{ key: "no", dir: "asc" }}
			minWidth="800px"
		/>
	)
}

export default InvoiceTransactionTab
