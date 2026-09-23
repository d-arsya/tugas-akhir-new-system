import { useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react"

import { cn } from "@roja/utils"

import type { SortDir, TableState } from "@/lib/legacy-table"

import LegacyPagination from "./legacy-pagination"
import LegacySelect from "./legacy-select"

export type LegacyColumn<T> = {
	key: string
	/** ReactNode, not string: Biaya Santri puts a check-all box and a tooltip icon in `<th>` */
	header: ReactNode
	// Legacy `<th width="…">`
	width?: string
	sortable?: boolean
	// `index` is DataTables' DT_RowIndex (1-based across pages)
	cell: (row: T, index: number) => ReactNode
}

type LegacyDataTableProps<T> = {
	columns: LegacyColumn<T>[]
	/** Legacy sets `style="min-width: …"` per table (1100px users, 1650px auth log, 950px reports). */
	minWidth?: string
	rows: T[]
	rowKey: (row: T, index: number) => string | number
	// recordsFiltered
	total: number
	state: TableState
	onStateChange: (state: TableState) => void
	processing: boolean
	// Before the first response DataTables shows `loadingRecords` (empty in legacy) instead of zeroRecords
	loaded: boolean
	// DataTables `order` default (`[[0, "asc"]]`): applied once, while nothing else is sorted
	initialSort?: { key: string; dir: SortDir }
	/** `paging: false` — Biaya Santri's account table renders every row and hides the pager. */
	paging?: boolean
	/** `fixedColumns: { left: n }` — the first n columns stay put while the table scrolls. */
	frozenColumns?: number
	/** Legacy adds `.tbr_selected` to checked rows on the Biaya Santri account table. */
	rowClassName?: (row: T, index: number) => string | undefined
}

const LENGTH_OPTIONS = ["10", "25", "50", "100"].map((value) => ({ value, label: value }))
// DataTables `searchDelay` default for server-side processing
const SEARCH_DELAY_MS = 400

// DataTables bootstrap4 sort arrows (`\2191` / `\2193`) restyled by public/assets/css/datatable.css
const SORT_ARROWS =
	"before:absolute before:right-[12px] before:bottom-[14px] before:block before:[font-family:'Open_Sans',Arial,sans-serif] before:font-light before:opacity-30 before:content-['↑'] after:absolute after:right-[6px] after:bottom-[14px] after:block after:[font-family:'Open_Sans',Arial,sans-serif] after:font-light after:opacity-30 after:content-['↓']"
const SORTED_ASC = "before:font-bold before:text-[var(--secondary)] before:opacity-100 after:font-bold"
const SORTED_DESC = "after:font-bold after:text-[var(--secondary)] after:opacity-100 before:font-bold"

const SpinnerIcon = (): JSX.Element => (
	<span className="mr-[8px] inline-block h-[20px] w-[20px] animate-spin rounded-full border-2 border-white! border-r-transparent! align-[-0.125em] [animation-duration:0.75s]" role="status" />
)

// Port of the legacy server-side DataTables setup (`sDom: '<"row"<"col-lg-6"l><"col-lg-6"f>><"table-responsive"t>pr'`)
const LegacyDataTable = <T,>({
	columns,
	rows,
	rowKey,
	total,
	state,
	onStateChange,
	processing,
	loaded,
	initialSort,
	minWidth = "950px",
	paging = true,
	frozenColumns = 0,
	rowClassName,
}: LegacyDataTableProps<T>): JSX.Element => {
	const [search, setSearch] = useState(state.search)
	const seeded = useRef(false)

	// Parent resets (e.g. the sticky toolbar) clear the box too
	useEffect(() => setSearch(state.search), [state.search])

	// DataTables applies its default `order` on init, before the first draw
	useEffect(() => {
		if (seeded.current || initialSort === undefined || state.sort !== null) return
		seeded.current = true
		onStateChange({ ...state, sort: initialSort })
	}, [initialSort, state, onStateChange])

	useEffect(() => {
		if (search === state.search) return undefined
		const timer = window.setTimeout(() => onStateChange({ ...state, search, page: 1 }), SEARCH_DELAY_MS)
		return () => window.clearTimeout(timer)
	}, [search, state, onStateChange])

	// DataTables `orderSequence: ["asc", "desc"]`: a sorted column toggles, a new one starts ascending
	const toggleSort = (key: string): void => {
		const dir: SortDir = state.sort?.key === key && state.sort.dir === "asc" ? "desc" : "asc"
		onStateChange({ ...state, sort: { key, dir }, page: 1 })
	}

	const pages = Math.max(1, Math.ceil(total / state.length))
	const offset = paging ? (state.page - 1) * state.length : 0

	// `fixedColumns: { left: n }` — sticky cells need a left offset, so accumulate the widths
	const frozenLeft = (index: number): string | undefined => {
		if (index >= frozenColumns) return undefined
		return columns
			.slice(0, index)
			.map((column) => column.width ?? "0px")
			.reduce((acc, width) => `calc(${acc} + ${width})`, "0px")
	}

	return (
		<div className="relative">
			<div className="mx-[-15px] flex flex-wrap">
				{/*
				 * The `dom` string keeps both half-width columns either way, but DataTables' own
				 * `_fnFeatureHtmlLength` returns `null` when `bPaginate` is off, so the length menu
				 * itself is never built on a non-paging table (Biaya Santri level 3).
				 */}
				<div className="w-full px-[15px] text-center min-[992px]:w-1/2 min-[993px]:text-left">
					{paging ? (
						<label className="mb-[8px] inline-block">
							<LegacySelect
								value={String(state.length)}
								options={LENGTH_OPTIONS}
								searchable={false}
								onChange={(value) => onStateChange({ ...state, length: Number(value), page: 1 })}
								className="mr-[10px] inline-flex w-[75px] rounded-[5px]"
							/>
						</label>
					) : null}
				</div>
				<div className="w-full px-[15px] text-center min-[992px]:w-1/2 min-[993px]:text-right">
					{/*
					 * `overflow-hidden` is load-bearing. Bootstrap makes the search `input` `display: block`,
					 * so legacy's label has no in-flow line box and takes its baseline from its bottom margin
					 * edge — the strut then hangs 7.41px below it, making the toolbar 15.41px taller than the
					 * label at every width. Tailwind's preflight leaves the input inline-block, so without this
					 * the port is 7.4px short: below 993px on every table, and at all widths when paging is off.
					 */}
					<label className="mb-[8px] inline-block w-full overflow-hidden min-[992px]:w-1/2">
						<input
							type="search"
							value={search}
							placeholder="Search"
							onChange={(event) => setSearch(event.target.value)}
							className="h-[40px] w-full rounded-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[16px] py-[6px] text-[12px] leading-[22.2px] text-[var(--body-txt-inverse)] outline-none placeholder:text-[var(--grey)] focus:border-[var(--secondary)]! [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
						/>
					</label>
				</div>
			</div>

			<div className="w-full overflow-x-auto">
				<table
					className="m-0 w-full border-collapse text-[12px] leading-[22.4px] text-[#212529]"
					style={{ minWidth }}
				>
					<thead>
						<tr>
							{columns.map((column, index) => {
								const sorted = state.sort?.key === column.key ? state.sort.dir : null
								return (
									<th
										key={column.key}
										style={{ width: column.width, left: frozenLeft(index) } as CSSProperties}
										onClick={column.sortable ? () => toggleSort(column.key) : undefined}
										aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
										className={cn(
											"relative border-0 border-b border-[var(--table-inverse)]! py-[12px] pr-[21px] pl-[12px] text-left align-middle font-semibold text-[var(--table-head-txt-inverse)]",
											index < frozenColumns && "sticky z-[2] bg-[var(--bg-secondary)]",
											column.sortable && cn("cursor-pointer select-none", SORT_ARROWS, sorted === "asc" && SORTED_ASC, sorted === "desc" && SORTED_DESC),
										)}
									>
										{column.header}
									</th>
								)
							})}
						</tr>
					</thead>
					<tbody>
						{rows.length === 0 ? (
							<tr>
								<td colSpan={columns.length} className="py-[50px] text-center leading-[18px] text-[var(--table-txt-inverse)]">
									{loaded ? "No matching records found" : ""}
								</td>
							</tr>
						) : (
							rows.map((row, index) => (
								<tr
									key={rowKey(row, index)}
									className={cn("group hover:bg-[var(--table-inverse)]", rowClassName?.(row, index))}
								>
									{columns.map((column, columnIndex) => (
										<td
											key={column.key}
											style={{ left: frozenLeft(columnIndex) } as CSSProperties}
											className={cn(
												"border-0 border-b border-[var(--table-inverse)]! p-[12px] align-middle leading-[18px] text-[var(--table-txt-inverse)] group-last:border-b-0",
												columnIndex < frozenColumns && "sticky z-[1] bg-[var(--bg-secondary)]",
											)}
										>
											{column.cell(row, offset + index + 1)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{paging ? (
				<LegacyPagination page={state.page} pages={pages} onChange={(page) => onStateChange({ ...state, page })} />
			) : null}

			{processing ? (
				<div className="absolute top-[59%] left-1/2 z-[3] mt-[-26px] ml-[-95px] w-[190px] rounded-[100px] bg-[var(--primary)] py-[12px] text-center text-white shadow-[0px_8px_10px_0px_rgba(228,0,126,0.25)]">
					<div className="flex items-center justify-center">
						<SpinnerIcon /> Sedang memproses
					</div>
				</div>
			) : null}
		</div>
	)
}

export default LegacyDataTable
