import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { EwalletTransactionStatus, EwalletWalletTransactionRow } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import { useEwalletTransactions } from "@/hooks/use-ewallets"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"
import { rupiahDots } from "@/lib/legacy-format"

// Legacy `assets/js/ewallet/transaction-datatable.js` + `EwalletController@transactionList`.
//
// The port serves the wallet's rows in one answer and pages them in the browser (the brief's
// decision — legacy ran `DataTables::collection` behind `serverSide: true`, which is the same rows
// paged by the server). Orders and searches run over the same values the cells show, with the
// unix stamp behind the date and the raw amount behind the money, as yajra sorts the model's own
// attributes rather than the formatted text.

// yajra's `addIndexColumn()` numbers the rows once, before any sorting
type NumberedRow = EwalletWalletTransactionRow & { no: number }

const STATUS_TEXT: Record<EwalletTransactionStatus, string> = {
	waiting: "Menunggu",
	valid: "Berhasil",
	invalid: "Gagal",
	process: "Diproses",
}

const STATUS_VARIANT = { waiting: "warning", valid: "success", invalid: "danger", process: "primary" } as const

/** `EwalletController@statusLabel` — anything outside the four states renders no label. */
const statusText = (status: string): string => STATUS_TEXT[status as EwalletTransactionStatus] ?? ""

const cellText = (row: NumberedRow, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "code":
			return row.code ?? ""
		case "name":
			return row.name
		case "paymentMethod":
			return row.paymentMethod ?? ""
		case "amount":
			return String(row.amount)
		case "createdAt":
			return String(row.createdAtTs).padStart(12, "0")
		// Searched as displayed; only ever asked for by `SEARCH_KEYS`, never a sort key
		case "createdAtDisplay":
			return row.createdAt
		case "status":
			return statusText(row.status)
		case "action":
			return row.target
		default:
			return ""
	}
}

// DataTables searches every column except `DT_RowIndex`
const SEARCH_KEYS = ["code", "name", "paymentMethod", "amount", "createdAtDisplay", "status"]

/** `MerchantService::editButton` — the same magnifier for all three targets; only `none` has no `href`. */
const ActionCell = ({ row }: { row: EwalletWalletTransactionRow }): JSX.Element => {
	const icon = <img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
	return (
		<div>
			{row.target === "transaction" ? (
				<Link to="/ewallets/transactions/$transactionId" params={{ transactionId: String(row.id) }} className="inline-block align-middle whitespace-normal">
					{icon}
				</Link>
			) : row.target === "history" ? (
				<Link to="/ewallet-transactions/$transactionId" params={{ transactionId: String(row.id) }} className="inline-block align-middle whitespace-normal">
					{icon}
				</Link>
			) : (
				<a className="inline-block align-middle whitespace-normal">{icon}</a>
			)}
		</div>
	)
}

const columns: LegacyColumn<NumberedRow>[] = [
	{ key: "no", header: "No", sortable: true, cell: (row) => row.no },
	{ key: "code", header: "ID Transaksi", sortable: true, cell: (row) => row.code },
	{ key: "name", header: "Jenis", sortable: true, cell: (row) => row.name },
	{ key: "paymentMethod", header: "Metode", sortable: true, cell: (row) => row.paymentMethod },
	{ key: "amount", header: "Nominal", sortable: true, cell: (row) => rupiahDots(row.amount) },
	{ key: "createdAt", header: "Tanggal", sortable: true, cell: (row) => row.createdAt },
	{
		key: "status",
		header: "Status",
		// `orderFalse = [6]` — the Status column is the one that cannot be sorted (Actions, the last, can)
		sortable: false,
		cell: (row) => {
			const label = statusText(row.status)
			return label === "" ? "" : <LegacyLabel variant={STATUS_VARIANT[row.status]}>{label}</LegacyLabel>
		},
	},
	{ key: "action", header: "Actions", sortable: true, cell: (row) => <ActionCell row={row} /> },
]

/** `.card.tbr_card > .card-body.p-4 > .table-responsive > table.tbr_table` */
const EwalletTransactionTable = ({ ewalletId }: { ewalletId: number }): JSX.Element => {
	const { data, isFetching, isSuccess } = useEwalletTransactions(ewalletId)
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)

	const numbered = useMemo<NumberedRow[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	return (
		<LegacyCard>
			<LegacyDataTable
				columns={columns}
				rows={page.rows}
				rowKey={(row) => row.id}
				total={page.total}
				state={state}
				onStateChange={setState}
				processing={isFetching}
				loaded={isSuccess}
				// No `order` option: DataTables' default `[[0, "asc"]]` sorts the No column ascending
				initialSort={{ key: "no", dir: "asc" }}
				minWidth="0px"
				emptyText="Kamu belum memiliki transaksi"
				zeroRecordsText="Transaksi yang kamu cari tidak ada"
				// `if (data.status.includes("Diproses")) $(row).find("td").css("background-color", "#FFF6F7")`
				rowClassName={(row) => (row.status === "process" ? "[&>td]:bg-[#FFF6F7]" : undefined)}
			/>
		</LegacyCard>
	)
}

export default EwalletTransactionTable
