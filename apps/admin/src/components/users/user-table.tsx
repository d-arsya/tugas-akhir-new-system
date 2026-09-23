import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminUserRow } from "@roja/types"

import LegacyConfirmDelete from "@/components/legacy/legacy-confirm-delete"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useDeleteUser, useUsers } from "@/hooks/use-users"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

// The row number is baked into the legacy payload, so it keeps its value when the table is re-sorted
type NumberedUser = AdminUserRow & { no: number }

// `UserService::getAccountStatus()` — a null `is_blocked` counts as Active
const statusText = (row: AdminUserRow): string => (row.isBlocked ? "Deactive" : "Active")

// DataTables searches and sorts the rendered cell text; the "Dibuat Pada" cell hides the unix
// timestamp in front of the date (`RegistrantService::datatableDate`), which is what makes it sort by date
const cellText = (row: NumberedUser, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "name":
			return row.name ?? ""
		case "email":
			return row.email ?? ""
		case "role":
			return row.role ?? ""
		case "createdAt":
			return `${row.createdAtTs} ${row.createdAt}`
		case "status":
			return statusText(row)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "name", "email", "role", "createdAt", "status"]

// `user/index.blade.php` + `default-datatable.js` / `default-delete.js`
const UserTable = (): JSX.Element => {
	const { data, isFetching, isSuccess } = useUsers()
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [pending, setPending] = useState<AdminUserRow | null>(null)
	const deleteUser = useDeleteUser()

	const numbered = useMemo<NumberedUser[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	// `done`: reload the table (the mutation invalidates it) and close the popup 1000 ms later
	const remove = useLegacySubmit({
		mutationFn: (id: number) => deleteUser.mutateAsync(id),
		onDone: () => setPending(null),
	})

	const columns: LegacyColumn<NumberedUser>[] = [
		{ key: "no", header: "No", width: "6%", sortable: true, cell: (row) => row.no },
		{ key: "name", header: "Nama Lengkap", width: "20%", sortable: true, cell: (row) => row.name },
		{ key: "email", header: "Email", width: "20%", sortable: true, cell: (row) => row.email },
		{ key: "role", header: "Role", width: "13%", sortable: true, cell: (row) => row.role },
		{
			key: "createdAt",
			header: "Dibuat Pada",
			width: "23%",
			sortable: true,
			cell: (row) => (
				<div>
					<span className="hidden">{row.createdAtTs}</span> {row.createdAt}
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			width: "11%",
			sortable: true,
			// Legacy adds `text-truncate` to the Deactive label only
			cell: (row) => (
				<LegacyLabel variant={row.isBlocked ? "danger" : "success"} className={row.isBlocked ? "truncate" : ""}>
					{statusText(row)}
				</LegacyLabel>
			),
		},
		{
			key: "actions",
			header: "Actions",
			width: "7%",
			// `initDatatable(url, [6])`
			sortable: false,
			cell: (row) => (
				<div className="flex items-center">
					{/* `mr-2` plus the inline whitespace legacy leaves between the two anchors */}
					<Link to="/users/$userId/edit" params={{ userId: String(row.id) }} className="mr-[12px]">
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
					</Link>
					<button type="button" className="cursor-pointer" onClick={() => setPending(row)}>
						<img src="/assets/svg/icons/data_destroy.svg" alt="Destroy" width={24} height={24} />
					</button>
				</div>
			),
		},
	]

	return (
		<>
			{/* `<table … style="min-width: 1100px;">` */}
			<LegacyDataTable
				columns={columns}
				rows={page.rows}
				rowKey={(row) => row.id}
				total={page.total}
				state={state}
				onStateChange={setState}
				processing={isFetching}
				loaded={isSuccess}
				initialSort={{ key: "no", dir: "asc" }}
				minWidth="1100px"
			/>

			<LegacyConfirmDelete
				open={pending !== null}
				onCancel={() => setPending(null)}
				onConfirm={() => {
					if (pending) remove.submit(pending.id)
				}}
				loading={remove.submitting}
			/>
		</>
	)
}

export default UserTable
