import type { JSX, ReactNode } from "react"

import type { StudentTransactionDetail } from "@roja/types"

import { formatIndoDate, rupiahLabel } from "@/lib/legacy-format"

// Legacy `student-transaction/detail.blade.php:83-145` + `student-invoice/custom-detail.css`.
// Owned by WS P1-C.

// `.table-style` (custom-detail.css 5)
const TableStyle = ({ children }: { children: ReactNode }): JSX.Element => (
	<div className="mt-[8px] mb-[20px] overflow-auto rounded-[10px] border-2 border-[#f7f7f7] bg-[#f7f7f7]">
		<table className="m-0 w-full border-collapse">{children}</table>
	</div>
)

// `table tr th` (custom-detail.css 11) + `.text-weight-600.tbr_text-grey`
const Th = ({
	children,
	className,
	colSpan,
}: {
	children?: ReactNode
	className?: string
	colSpan?: number
}): JSX.Element => (
	<th
		colSpan={colSpan}
		className={`bg-[#f7f7f7]! px-[20px] py-[12px] text-left font-semibold! text-[var(--grey)] ${className ?? ""}`}
	>
		{children}
	</th>
)

// `.cost-table tr td` (custom-detail.css 12) over `table tbody tr { background: #FFFFFF }`
const Td = ({ children }: { children: ReactNode }): JSX.Element => (
	<td className="border-t-2 border-t-[#f9f9f9] bg-white px-[20px] py-[12px]">{children}</td>
)

// `<span class="tbr_text-grey font-italic">`
const Caption = ({ children }: { children: ReactNode }): JSX.Element => (
	<span className="text-[var(--grey)] italic">{children}</span>
)

/**
 * `:131` — `formatDate($transaction->paid_at, 'd F Y \j\a\m\ H:i')`, and `:48` the same with
 * `'d F Y \j\a\m H:i'`. The escaped space in the first makes them render identically.
 * `formatIndoDate(…, true)` joins with ", ", so the "jam" form is built here.
 */
export const formatIndoDateJam = (local: string | null): string => {
	if (!local) return ""
	return `${formatIndoDate(local)} jam ${local.slice(11, 16)}`
}

const TransactionDetailTables = ({ detail }: { detail: StudentTransactionDetail }): JSX.Element => (
	<>
		<Caption>Item tagihan yang dipilih</Caption>
		<TableStyle>
			<thead>
				<tr className="bg-[#f7f7f7]!">
					<Th>No</Th>
					<Th>Nama Biaya</Th>
					<Th>Jatuh Tempo</Th>
					<Th>Biaya</Th>
				</tr>
			</thead>
			<tbody>
				{detail.items.map((item, index) => (
					<tr key={item.invoiceId} className="bg-white!">
						<Td>{index + 1}</Td>
						<Td>{item.name}</Td>
						<Td>{formatIndoDate(item.dueDate)}</Td>
						{/*
						 * `:101` renders `$total[$key]` for installment invoices and `$invoice->amount`
						 * otherwise. Both come from the pivot here: `amount` is the invoice snapshot
						 * taken when this payment was recorded, which is what the column means either
						 * way — and `pay` is never substituted for it (they differ in 1.039 live rows).
						 */}
						<Td>{rupiahLabel(item.amount)}</Td>
					</tr>
				))}
			</tbody>
			<tfoot>
				{/* `:106-110` — `colspan="2"`, then one empty `th`, then the total */}
				<tr className="font-semibold">
					<Th colSpan={2}>Sisa yang harus dibayar</Th>
					<Th />
					<Th className="text-[var(--primary)]!">{rupiahLabel(detail.totalAmount)}</Th>
				</tr>
			</tfoot>
		</TableStyle>

		<Caption>Item transaksi</Caption>
		<TableStyle>
			<thead>
				<tr className="bg-[#f7f7f7]!">
					<Th>No</Th>
					<Th>Keterangan</Th>
					<Th>Tanggal</Th>
					<Th>Total Biaya</Th>
					<Th>Dibayar</Th>
				</tr>
			</thead>
			<tbody>
				{/* `:128-134` — always exactly one row, hardcoded `{{ 1 }}` */}
				<tr className="bg-white!">
					<Td>1</Td>
					<Td>{detail.description}</Td>
					<Td>{formatIndoDateJam(detail.paidAt)}</Td>
					<Td>{rupiahLabel(detail.totalAmount)}</Td>
					{/* `:133` — the transaction's own `amount`, not the sum of the pivot rows */}
					<Td>{rupiahLabel(detail.amount)}</Td>
				</tr>
			</tbody>
			<tfoot>
				{/* `:137-142` — `colspan="2"`, then two empty `th`, then the balance */}
				<tr className="font-semibold">
					<Th colSpan={2}>Balance</Th>
					<Th />
					<Th />
					<Th className="text-[var(--primary)]!">{rupiahLabel(detail.balance)}</Th>
				</tr>
			</tfoot>
		</TableStyle>
	</>
)

export default TransactionDetailTables
