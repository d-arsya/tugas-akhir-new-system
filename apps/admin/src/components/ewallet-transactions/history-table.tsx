import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { EwalletHistoryRow, EwalletTransactionKind } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import type { UseServerTableResult } from "@/hooks/use-server-table"
import { rupiahLabel } from "@/lib/legacy-format"

import { StatusLabel } from "./transaction-striped"

const typeLabel = (type: EwalletTransactionKind): string =>
	type === "income" ? "Isi Saldo" : type === "expense" ? "Tarik Saldo" : "Jual Beli"

const DetailIcon = (): JSX.Element => <img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />

const ActionLink = ({ row }: { row: EwalletHistoryRow }): JSX.Element => (
	<div className="flex justify-center">
		{row.target === "history" ? (
			<Link to="/ewallet-transactions/$transactionId" params={{ transactionId: String(row.id) }} className="whitespace-normal">
				<DetailIcon />
			</Link>
		) : row.target === "transaction" ? (
			<Link to="/ewallets/transactions/$transactionId" params={{ transactionId: String(row.id) }} className="whitespace-normal">
				<DetailIcon />
			</Link>
		) : (
			<a className="whitespace-normal">
				<DetailIcon />
			</a>
		)}
	</div>
)

const columns: LegacyColumn<EwalletHistoryRow>[] = [
	{ key: "no", header: "No", sortable: false, cell: (_row, index) => index },
	{ key: "code", header: "ID Transaksi", sortable: true, cell: (row) => row.code },
	{ key: "type", header: "Jenis Transaksi", sortable: true, cell: (row) => typeLabel(row.type) },
	{ key: "paymentMethod", header: "Metode", sortable: true, cell: (row) => row.paymentMethod },
	{ key: "totalAmount", header: "Nominal", sortable: true, cell: (row) => rupiahLabel(row.totalAmount) },
	{ key: "createdAt", header: "Tanggal Transaksi", sortable: true, cell: (row) => row.createdAt },
	{ key: "status", header: "Status", sortable: true, cell: (row) => <StatusLabel status={row.status} inTable /> },
	{ key: "action", header: <div className="text-center">Actions</div>, sortable: false, cell: (row) => <ActionLink row={row} /> },
]

const HistoryTable = ({ table }: { table: UseServerTableResult<EwalletHistoryRow> }): JSX.Element => (
	<LegacyDataTable
		columns={columns}
		rows={table.rows}
		rowKey={(row) => row.id}
		total={table.total}
		state={table.state}
		onStateChange={table.setState}
		processing={table.processing}
		loaded={table.loaded}
		initialSort={{ key: "createdAt", dir: "desc" }}
		minWidth="1400px"
		toolbar={false}
	/>
)

export default HistoryTable
