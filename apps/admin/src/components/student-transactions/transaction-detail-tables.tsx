import type { JSX, ReactNode } from "react"

import type { StudentTransactionDetail } from "@roja/types"

import { formatIndoDate, rupiahLabel } from "@/lib/legacy-format"

const TableStyle = ({ children }: { children: ReactNode }): JSX.Element => (
	<div className="mt-[8px] mb-[20px] overflow-auto rounded-[10px] border-2 border-[#f7f7f7] bg-[#f7f7f7]">
		<table className="m-0 w-full border-collapse">{children}</table>
	</div>
)

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

const Td = ({ children }: { children: ReactNode }): JSX.Element => (
	<td className="border-t-2 border-t-[#f9f9f9] bg-white px-[20px] py-[12px]">{children}</td>
)

const Caption = ({ children }: { children: ReactNode }): JSX.Element => (
	<span className="text-[var(--grey)] italic">{children}</span>
)

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
						<Td>{rupiahLabel(item.amount)}</Td>
					</tr>
				))}
			</tbody>
			<tfoot>
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
				<tr className="bg-white!">
					<Td>1</Td>
					<Td>{detail.description}</Td>
					<Td>{formatIndoDateJam(detail.paidAt)}</Td>
					<Td>{rupiahLabel(detail.totalAmount)}</Td>
					<Td>{rupiahLabel(detail.amount)}</Td>
				</tr>
			</tbody>
			<tfoot>
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
