import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { MerchantRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import { useMerchants } from "@/hooks/use-merchants"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

// yajra's collection engine numbers the rows once, before any sorting
type NumberedMerchant = MerchantRow & { no: number }

// `editColumn('is_blocked', …)` — `Active` when the flag is falsy, `Nonactive` otherwise
const statusText = (row: MerchantRow): string => (row.isBlocked ? "Nonactive" : "Active")

const cellText = (row: NumberedMerchant, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "uniqueNumber":
			return row.uniqueNumber
		case "name":
			return row.name ?? ""
		case "merchantName":
			return row.merchantName ?? ""
		case "email":
			return row.email ?? ""
		case "createdAt":
			return row.createdAt
		case "isBlocked":
			return statusText(row)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["uniqueNumber", "name", "merchantName", "email", "createdAt", "isBlocked"]

/**
 * `merchant/index.blade.php` + `assets/js/merchant/merchant-datatable.js`.
 *
 * Client-side throughout: legacy sets no `serverSide`, so the whole collection is fetched once
 * and DataTables searches, sorts and pages it in the browser. Column 0 is not orderable and
 * neither is "Actions"; there is no default `order`, so the rows arrive in list order.
 *
 * Legacy's `created_at` column is the **formatted string only** — `d F Y`, with no hidden unix
 * span — so it sorts alphabetically, which is bug B-7 all over again. Kept verbatim here
 * because it is what the column shows; `createdAtTs` rides along in the payload for anyone who
 * wants to fix it later.
 */
const MerchantTable = (): JSX.Element => {
	const { data, isFetching, isSuccess } = useMerchants()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)

	const numbered = useMemo<NumberedMerchant[]>(
		() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })),
		[data],
	)
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedMerchant>[] = [
		{ key: "no", header: "No", sortable: false, cell: (row) => row.no },
		{ key: "uniqueNumber", header: "Nomor Merchant", sortable: true, cell: (row) => row.uniqueNumber },
		{ key: "name", header: "Nama Pemilik", sortable: true, cell: (row) => row.name },
		{ key: "merchantName", header: "Nama Merchant", sortable: true, cell: (row) => row.merchantName },
		{ key: "email", header: "Email", sortable: true, cell: (row) => row.email },
		{ key: "createdAt", header: "Dibuat Pada", sortable: true, cell: (row) => row.createdAt },
		{
			key: "isBlocked",
			header: "Status",
			sortable: true,
			cell: (row) => <LegacyLabel variant={row.isBlocked ? "danger" : "success"}>{statusText(row)}</LegacyLabel>,
		},
		{
			key: "actions",
			header: "Actions",
			sortable: false,
			// `<div class='actions d-flex justify-content-center'>` with a single anchor — no
			// inter-icon whitespace to preserve here, unlike the two-icon Akademik cells
			cell: (row) => (
				<div className="flex justify-center">
					{/* `.modal-with-zoom-anim` is dead: magnific-popup is never initialised on this page */}
					<Link to="/merchants/$merchantId/edit" params={{ merchantId: String(row.id) }} className="inline-block align-middle">
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
					</Link>
				</div>
			),
		},
	]

	return (
		// `<table … style="min-width: 1200px;">`
		<LegacyDataTable
			columns={columns}
			rows={page.rows}
			rowKey={(row) => row.id}
			total={page.total}
			state={state}
			onStateChange={setState}
			processing={isFetching}
			loaded={isSuccess}
			minWidth="1200px"
		/>
	)
}

export default MerchantTable
