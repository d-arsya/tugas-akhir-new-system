import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import type { ServerTableQuery, ServerTableResult, ServerTableSortDir } from "@roja/types"

import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

/**
 * Server-paged counterpart to `clientTable()`.
 *
 * Three legacy lists in Pembayaran Santri are `serverSide` (the student picker, the
 * Tagihan tab and the Riwayat index) — every Data Master list was client-side, so this
 * is new. `LegacyDataTable` is already externally controlled, so the only thing needed
 * is to fetch on state change instead of slicing locally.
 *
 * `keepPreviousData` reproduces DataTables' behaviour of leaving the old rows on screen
 * under the processing overlay rather than blanking the table between draws.
 */
export type UseServerTableResult<TRow> = {
	state: TableState
	setState: (state: TableState) => void
	rows: TRow[]
	/** `recordsFiltered` — what legacy wrote into the "Dimunculkan dari total N" caption. */
	total: number
	/** `recordsTotal`, before any search or filter. */
	totalUnfiltered: number
	processing: boolean
	loaded: boolean
}

export type UseServerTableOptions<TRow, TExtra> = {
	queryKey: readonly unknown[]
	fetcher: (query: ServerTableQuery & TExtra) => Promise<ServerTableResult<TRow>>
	/** Page-specific filters (grade, cost, date range…) merged into every request. */
	extra: TExtra
	initialState?: TableState
	/** Legacy DataTables waits before firing a search; 0 disables. */
	searchDelayMs?: number
	enabled?: boolean
}

export const useServerTable = <TRow, TExtra extends object>({
	queryKey,
	fetcher,
	extra,
	initialState,
	searchDelayMs = 400,
	enabled = true,
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
