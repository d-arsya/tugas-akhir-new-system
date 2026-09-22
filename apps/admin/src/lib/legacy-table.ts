// DataTables request state shared by the legacy table port and the pages using it

export type SortDir = "asc" | "desc"
export type TableState = { page: number; length: number; search: string; sort: { key: string; dir: SortDir } | null }

// Legacy DataTables defaults: 10 rows, no initial order (order: [])
export const INITIAL_TABLE_STATE: TableState = { page: 1, length: 10, search: "", sort: null }

// yajra `DataTables::of($array)`: global search, ordering and paging over an in-memory collection
export const clientTable = <T>(
	rows: T[],
	state: TableState,
	text: (row: T, key: string) => string,
	searchKeys: string[],
): { rows: T[]; total: number } => {
	const query = state.search.trim().toLowerCase()
	const filtered = query ? rows.filter((row) => searchKeys.some((key) => text(row, key).toLowerCase().includes(query))) : rows
	const sort = state.sort
	const ordered = sort
		? [...filtered].sort(
				(a, b) =>
					text(a, sort.key).localeCompare(text(b, sort.key), undefined, { numeric: true, sensitivity: "base" }) *
					(sort.dir === "asc" ? 1 : -1),
			)
		: filtered
	const start = (state.page - 1) * state.length
	return { rows: ordered.slice(start, start + state.length), total: filtered.length }
}
