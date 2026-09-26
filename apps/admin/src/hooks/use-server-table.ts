import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import type { ServerTableQuery, ServerTableResult, ServerTableSortDir } from "@roja/types"

import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

export type UseServerTableResult<TRow> = {
	state: TableState
	setState: (state: TableState) => void
	rows: TRow[]
	total: number
	totalUnfiltered: number
	processing: boolean
	loaded: boolean
}

export type UseServerTableOptions<TRow, TExtra> = {
	queryKey: readonly unknown[]
	fetcher: (query: ServerTableQuery & TExtra) => Promise<ServerTableResult<TRow>>
	extra: TExtra
	initialState?: TableState
	searchDelayMs?: number
	enabled?: boolean
	staleTime?: number
}

export const useServerTable = <TRow, TExtra extends object>({
	queryKey,
	fetcher,
	extra,
	initialState,
	searchDelayMs = 400,
	enabled = true,
	staleTime,
}: UseServerTableOptions<TRow, TExtra>): UseServerTableResult<TRow> => {
	const [state, setState] = useState<TableState>(initialState ?? INITIAL_TABLE_STATE)
	const [debouncedSearch, setDebouncedSearch] = useState(state.search)

	useEffect(() => {
		if (searchDelayMs <= 0) {
			setDebouncedSearch(state.search)
			return
		}
		const timer = setTimeout(() => setDebouncedSearch(state.search), searchDelayMs)
		return () => clearTimeout(timer)
	}, [state.search, searchDelayMs])

	const query: ServerTableQuery & TExtra = {
		...extra,
		page: state.page,
		limit: state.length,
		...(debouncedSearch ? { search: debouncedSearch } : {}),
		...(state.sort
			? { orderBy: state.sort.key, orderDir: state.sort.dir as ServerTableSortDir }
			: {}),
	}

	const result = useQuery({
		queryKey: [...queryKey, query],
		queryFn: () => fetcher(query),
		placeholderData: keepPreviousData,
		enabled,
		...(staleTime === undefined ? {} : { staleTime }),
	})

	return {
		state,
		setState,
		rows: result.data?.rows ?? [],
		total: result.data?.recordsFiltered ?? 0,
		totalUnfiltered: result.data?.recordsTotal ?? 0,
		processing: result.isFetching,
		loaded: result.isSuccess || result.isError,
	}
}

export default useServerTable
