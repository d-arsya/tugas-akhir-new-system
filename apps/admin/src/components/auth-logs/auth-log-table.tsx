import { useMemo, useState, type JSX } from "react"

import type { AuthLogRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { authLogParams, useAuthLogs } from "@/hooks/use-auth-logs"
import { useLegacyLoadError } from "@/hooks/use-reports"
import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

// `auth-log/index.blade.php` — `initDatatable(url, [])`, so every column is orderable
const COLUMNS: LegacyColumn<AuthLogRow>[] = [
	{ key: "no", header: "No", width: "4%", sortable: true, cell: (_row, index) => index },
	{ key: "email", header: "Email", width: "16%", sortable: true, cell: (row) => row.email },
	// Legacy labels the browser column "User Agent"
	{ key: "browser", header: "User Agent", width: "10%", sortable: true, cell: (row) => row.browser },
	{ key: "os", header: "OS", width: "8%", sortable: true, cell: (row) => row.os },
	{ key: "duration", header: "Duration", width: "12%", sortable: true, cell: (row) => row.duration },
	{ key: "lastSeen", header: "Last Seen", width: "12%", sortable: true, cell: (row) => row.lastSeen },
	{ key: "lastLogin", header: "Last Login", width: "15%", sortable: true, cell: (row) => row.lastLogin },
	{ key: "lastLogout", header: "Last Logout", width: "15%", sortable: true, cell: (row) => row.lastLogout },
	{ key: "loginStatus", header: "Login Status", width: "8%", sortable: true, cell: (row) => row.loginStatus },
]

const AuthLogTable = (): JSX.Element => {
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const params = useMemo(() => authLogParams(state), [state])
	const { data, isFetching, isSuccess, isError } = useAuthLogs(params)
	useLegacyLoadError(isError)

	return (
		// `<table … style="min-width: 1650px;">`
		<LegacyDataTable
			columns={COLUMNS}
			rows={data?.data ?? []}
			rowKey={(row) => row.id}
			total={data?.meta.total ?? 0}
			state={state}
			onStateChange={setState}
			processing={isFetching}
			loaded={isSuccess}
			initialSort={{ key: "no", dir: "asc" }}
			minWidth="1650px"
		/>
	)
}

export default AuthLogTable
