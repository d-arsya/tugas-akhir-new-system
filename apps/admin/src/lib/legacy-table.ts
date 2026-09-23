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
	// DataTables smart search: the term is split on whitespace and every word must show up somewhere in the row
	const words = state.search.trim().toLowerCase().split(/\s+/).filter((word) => word !== "")
	const filtered =
		words.length > 0
			? rows.filter((row) => {
					const cells = searchKeys.map((key) => text(row, key).toLowerCase())
					return words.every((word) => cells.some((cell) => cell.includes(word)))
				})
			: rows
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
