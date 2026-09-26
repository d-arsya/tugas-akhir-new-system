export type SortDir = "asc" | "desc"
export type TableState = { page: number; length: number; search: string; sort: { key: string; dir: SortDir } | null }

export const INITIAL_TABLE_STATE: TableState = { page: 1, length: 10, search: "", sort: null }

export const clientTable = <T>(
	rows: T[],
	state: TableState,
	text: (row: T, key: string) => string,
	searchKeys: string[],
): { rows: T[]; total: number } => {
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
