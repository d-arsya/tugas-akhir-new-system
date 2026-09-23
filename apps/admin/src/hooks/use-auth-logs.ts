import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { AuthLogPage, AuthLogParams } from "@roja/types"

import { adminApi } from "@/lib/api"
import type { TableState } from "@/lib/legacy-table"

// Legacy `auth-log.list` — the port pages on the server, so the DataTables state is the query key
export const authLogKeys = {
	all: ["admin-auth-logs"] as const,
	list: (params: AuthLogParams) => [...authLogKeys.all, "list", params] as const,
}

export const authLogParams = (table: TableState): AuthLogParams => ({
	page: table.page,
	limit: table.length,
	...(table.search ? { search: table.search } : {}),
	...(table.sort ? { sortBy: table.sort.key, sortDir: table.sort.dir } : {}),
})

export const useAuthLogs = (params: AuthLogParams): UseQueryResult<AuthLogPage> =>
	useQuery({
		queryKey: authLogKeys.list(params),
		queryFn: () => adminApi.getAuthLogs(params),
		// Keep the rows under the "Sedang memproses" overlay, like DataTables
		placeholderData: keepPreviousData,
	})
