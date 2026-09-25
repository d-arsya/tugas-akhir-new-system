import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { EwalletHistoryRow, EwalletTransactionKind } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import type { UseServerTableResult } from "@/hooks/use-server-table"
import { rupiahLabel } from "@/lib/legacy-format"

import { StatusLabel } from "./transaction-striped"

// Legacy ewallet-transaction-history-serverside.js `columns` and `_partials/{type,actions}.blade.php`

// `_partials/type.blade.php` — anything that is not income or expense reads "Jual Beli"
const typeLabel = (type: EwalletTransactionKind): string =>
	type === "income" ? "Isi Saldo" : type === "expense" ? "Tarik Saldo" : "Jual Beli"

const DetailIcon = (): JSX.Element => <img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />

/**
 * `_partials/actions.blade.php` — `.d-flex.justify-content-center > a.modal-with-zoom-anim.ws-normal`.
 * The anchor always renders; only a `valid` row gets an `href` (a purchase goes to the history
 * detail, cash and bank transfer to the transaction detail). The rest are dead anchors.
 */
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

// Column keys are the API's sort keys; `DT_RowIndex` and `actions` are `orderable: false`
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
	// `<table … style="min-width: 1400px;">`; `order: [[5, "desc"]]` is the created_at column
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
