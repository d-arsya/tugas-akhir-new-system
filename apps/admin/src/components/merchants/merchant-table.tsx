import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { MerchantRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import { useMerchants } from "@/hooks/use-merchants"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

type NumberedMerchant = MerchantRow & { no: number }

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
			cell: (row) => (
				<div className="flex justify-center">
					<Link to="/merchants/$merchantId/edit" params={{ merchantId: String(row.id) }} className="inline-block align-middle">
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
					</Link>
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
			processing={isFetching}
			loaded={isSuccess}
			minWidth="1200px"
		/>
	)
}

export default MerchantTable
