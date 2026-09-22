import { useEffect, useState, type CSSProperties, type JSX, type ReactNode } from "react"

import { cn } from "@roja/utils"

import type { SortDir, TableState } from "@/lib/legacy-table"

import LegacyPagination from "./legacy-pagination"
import LegacySelect from "./legacy-select"

export type LegacyColumn<T> = {
	key: string
	header: string
	// Legacy `<th width="…">`
	width?: string
	sortable?: boolean
	// `index` is DataTables' DT_RowIndex (1-based across pages)
	cell: (row: T, index: number) => ReactNode
}

type LegacyDataTableProps<T> = {
	columns: LegacyColumn<T>[]
	rows: T[]
	rowKey: (row: T, index: number) => string | number
	// recordsFiltered
	total: number
	state: TableState
	onStateChange: (state: TableState) => void
	processing: boolean
	// Before the first response DataTables shows `loadingRecords` (empty in legacy) instead of zeroRecords
	loaded: boolean
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
const LegacyDataTable = <T,>({ columns, rows, rowKey, total, state, onStateChange, processing, loaded }: LegacyDataTableProps<T>): JSX.Element => {
	const [search, setSearch] = useState(state.search)

	// Parent resets (e.g. the sticky toolbar) clear the box too
	useEffect(() => setSearch(state.search), [state.search])

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
	const offset = (state.page - 1) * state.length

	return (
		<div className="relative">
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full px-[15px] text-center min-[992px]:w-1/2 min-[993px]:text-left">
					<label className="mb-[8px] inline-block min-[993px]:pb-[7.4px]">
						<LegacySelect
							value={String(state.length)}
							options={LENGTH_OPTIONS}
							searchable={false}
							onChange={(value) => onStateChange({ ...state, length: Number(value), page: 1 })}
							className="mr-[10px] inline-flex w-[75px] rounded-[5px]"
						/>
					</label>
				</div>
				<div className="w-full px-[15px] text-center min-[992px]:w-1/2 min-[993px]:text-right">
					<label className="mb-[8px] inline-block w-full min-[992px]:w-1/2">
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
				<table className="m-0 w-full min-w-[950px] border-collapse text-[12px] leading-[22.4px] text-[#212529]">
					<thead>
						<tr>
							{columns.map((column) => {
								const sorted = state.sort?.key === column.key ? state.sort.dir : null
								return (
									<th
										key={column.key}
										style={{ width: column.width } as CSSProperties}
										onClick={column.sortable ? () => toggleSort(column.key) : undefined}
										aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
										className={cn(
											"relative border-0 border-b border-[var(--table-inverse)]! py-[12px] pr-[21px] pl-[12px] text-left align-middle font-semibold text-[var(--table-head-txt-inverse)]",
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
								<tr key={rowKey(row, index)} className="group hover:bg-[var(--table-inverse)]">
									{columns.map((column) => (
										<td
											key={column.key}
											className="border-0 border-b border-[var(--table-inverse)]! p-[12px] align-middle leading-[18px] text-[var(--table-txt-inverse)] group-last:border-b-0"
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

			<LegacyPagination page={state.page} pages={pages} onChange={(page) => onStateChange({ ...state, page })} />

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
