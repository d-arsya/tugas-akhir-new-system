import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { InvoiceTransactionRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"
import { formatIndoDate, rupiahLabel } from "@/lib/legacy-format"

// `student-invoice/partials/{history,cancel}.blade.php` + `@listTransaction` / `@listCancel`.
// Both tabs are `initCustomDatatables` — client-side paged, unlike the Tagihan tab.

// The `$no` counter legacy bakes into the payload, so it keeps its value when the table is re-sorted
type NumberedTransaction = InvoiceTransactionRow & { no: number }

const cellText = (row: NumberedTransaction, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "code":
			return `${row.transactionCode ?? ""} ${formatIndoDate(row.paidAt, true)}`
		// `getCost()` hides a `<span class="d-none">{amount}%</span>` sort key behind the rupiah text,
		// which the `any-number` sort type then reads — i.e. the column orders numerically
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
	/** The Dibatalkan tab swaps the cancel cross for a tooltip carrying `cancel_note`. */
	variant: "payments" | "cancelled"
	/** Opens the cancel modal. Owned by the payment workstream; omitted the icon is inert. */
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
			// `getcodeDate()`: the code in primary, a <br>, then the paid-at stamp in grey
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
							{/* `getActionCancel()` interpolated the note straight into `data-original-title`
							    with `data-html="true"` — stored XSS (F-6). React escapes it instead. */}
							<LegacyTooltip content={row.cancelNote ?? ""} placement="left" className="align-middle">
								<img src="/assets/svg/icons/data_note.svg" alt="Detail" width={24} height={24} />
							</LegacyTooltip>{" "}
						</>
					) : null}
					{/* Tailwind's preflight makes `img` a block, which would stack the icons; legacy's
					    two anchors sit on one line separated by the newline between them in the Blade */}
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
			// `initCustomDatatables` sets no `order`, so DataTables falls back to [[0, "asc"]]
			initialSort={{ key: "no", dir: "asc" }}
			minWidth="800px"
		/>
	)
}

export default InvoiceTransactionTab
