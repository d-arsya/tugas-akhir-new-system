import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { EwalletListRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import type { UseServerTableResult } from "@/hooks/use-server-table"
import { rupiahDots } from "@/lib/legacy-format"

import { DetailListIcon } from "./ewallet-icons"

const ACTION_CLASS =
	"inline-block rounded-[7px] bg-[#fae3f0] p-[7px] align-middle transition-all duration-300 hover:bg-[var(--primary)] hover:shadow-[0px_8px_10px_0px_rgba(228,0,126,0.25)] [&:hover_rect:last-of-type]:fill-white [&:hover_path:last-of-type]:fill-white"

const columns: LegacyColumn<EwalletListRow>[] = [
	{ key: "no", header: "No", width: "5%", sortable: false, cell: (_row, index) => index },
	{
		key: "uniqueId",
		header: "ID E-Wallet",
		width: "15%",
		sortable: true,
		cell: (row) => (
			<div className="flex items-center justify-between">
				<span>{row.uniqueId}</span>
				{row.processCount > 0 ? (
					<div className="flex h-[16px] w-[16px] items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] font-bold text-[var(--white)]">
						{row.processCount}
					</div>
				) : null}
			</div>
		),
	},
	{ key: "ownerName", header: "Nama Lengkap", sortable: true, cell: (row) => row.ownerName },
	{
		key: "ownerType",
		header: "Pengguna",
		width: "12%",
		sortable: true,
		cell: (row) => (
			<LegacyLabel variant={row.ownerType === "merchant" ? "warning" : "danger"}>
				{row.ownerType === "merchant" ? "Merchant" : "Santri"}
			</LegacyLabel>
		),
	},
	{ key: "storedBalance", header: "Saldo", width: "15%", sortable: true, cell: (row) => rupiahDots(row.storedBalance) },
	{ key: "transactionCount", header: "Transaksi", width: "12%", sortable: true, cell: (row) => row.transactionCount },
	{
		key: "isActive",
		header: "S. E-Wallet",
		width: "13%",
		sortable: true,
		cell: (row) => <LegacyLabel variant={row.isActive ? "success" : "danger"}>{row.isActive ? "Aktif" : "Nonaktif"}</LegacyLabel>,
	},
	{
		key: "action",
		header: "",
		width: "10%",
		sortable: false,
		cell: (row) => (
			<div>
				<Link to="/ewallets/$ewalletId" params={{ ewalletId: String(row.id) }} className={ACTION_CLASS}>
					<DetailListIcon />
				</Link>
			</div>
		),
	},
]

type EwalletTableProps = { table: UseServerTableResult<EwalletListRow> }

const EwalletTable = ({ table }: EwalletTableProps): JSX.Element => (
	<LegacyDataTable
		columns={columns}
		rows={table.rows}
		rowKey={(row) => row.id}
		total={table.total}
		state={table.state}
		onStateChange={table.setState}
		processing={table.processing}
		loaded={table.loaded}
		initialSort={{ key: "uniqueId", dir: "desc" }}
		minWidth="0px"
		toolbar={false}
	/>
)

export default EwalletTable
