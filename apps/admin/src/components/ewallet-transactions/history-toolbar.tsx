import type { JSX } from "react"

import { cn } from "@roja/utils"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyDateRange from "@/components/legacy/legacy-date-range"
import LegacySelect from "@/components/legacy/legacy-select"
import type { EwalletHistoryDateRange, EwalletHistoryFilters } from "@/hooks/use-ewallet-transactions"

// Legacy ewallet/transaction-history/index.blade.php — the toolbar row. The DataTable's own
// length menu and search box are hidden (`<"d-none"lf>`), so the page draws its own.

const ENTRY_OPTIONS = ["10", "25", "50", "100"].map((value) => ({ value, label: value }))

const STATUS_OPTIONS = [
	{ value: "", label: "Status Transaksi" },
	{ value: "valid", label: "Berhasil" },
	{ value: "process", label: "Diproses" },
	{ value: "waiting", label: "Menunggu" },
	{ value: "invalid", label: "Gagal" },
]

const TYPE_OPTIONS = [
	{ value: "", label: "Jenis Transaksi" },
	{ value: "purchase", label: "Jual Beli" },
	{ value: "income", label: "Isi Saldo" },
	{ value: "expense", label: "Tarik Saldo" },
]

// `.tbr_btn-light-warning` (app.css 672-676, 791-797) — the kit has no such variant
const LIGHT_WARNING =
	"bg-[rgba(var(--warning-rgb),0.16)] text-[var(--warning)] hover:bg-[var(--warning)] hover:text-white focus:bg-[var(--warning)] focus:text-white active:bg-[var(--warning)] active:text-white"

const FilterIcon = (): JSX.Element => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M1.87494 3C1.13432 3 0.464003 3.43594 0.164003 4.11094C-0.135997 4.78594 -0.0141219 5.57812 0.482753 6.12656L5.24994 11.4281V17.25C5.24994 17.7234 5.47025 18.1688 5.84994 18.45L8.84994 20.7C9.30463 21.0422 9.914 21.0938 10.4203 20.8406C10.9265 20.5875 11.2499 20.0672 11.2499 19.5V11.4281L16.0171 6.13125C16.514 5.58281 16.6359 4.79063 16.3359 4.11563C16.0359 3.44063 15.3656 3 14.6249 3H1.87494Z"
			fill="#FFA800"
		/>
		<path opacity="0.4" d="M18 4.5C18 3.67157 18.6716 3 19.5 3H22.5C23.3284 3 24 3.67157 24 4.5C24 5.32843 23.3284 6 22.5 6H19.5C18.6716 6 18 5.32843 18 4.5Z" fill="#FFA800" />
		<path opacity="0.4" d="M15 19.5C15 18.6716 15.6716 18 16.5 18H22.5C23.3284 18 24 18.6716 24 19.5C24 20.3284 23.3284 21 22.5 21H16.5C15.6716 21 15 20.3284 15 19.5Z" fill="#FFA800" />
		<path opacity="0.4" d="M15 12C15 11.1716 15.6716 10.5 16.5 10.5H22.5C23.3284 10.5 24 11.1716 24 12C24 12.8284 23.3284 13.5 22.5 13.5H16.5C15.6716 13.5 15 12.8284 15 12Z" fill="#FFA800" />
	</svg>
)

const ExportIcon = (): JSX.Element => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g clipPath="url(#clip0_353_2878)">
			<path
				opacity="0.3"
				d="M2 13C2 12.5 2.5 12 3 12C3.5 12 4 12.5 4 13C4 13.3333 4 15 4 18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V13C20 12.4477 20.4477 12 21 12C21.5523 12 22 12.4477 22 13V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18C2 15 2 13.3333 2 13Z"
				fill="white"
			/>
			<path
				opacity="0.3"
				d="M11 14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14L13 2C13 1.44771 12.5523 1 12 1C11.4477 1 11 1.44771 11 2L11 14Z"
				fill="white"
			/>
			<path
				d="M16.2929 9.29289C16.6834 8.90237 17.3166 8.90237 17.7071 9.29289C18.0976 9.68342 18.0976 10.3166 17.7071 10.7071L12.7071 15.7071C12.331 16.0832 11.7264 16.0991 11.331 15.7433L6.33104 11.2433C5.92053 10.8738 5.88725 10.2415 6.25671 9.83103C6.62617 9.42052 7.25845 9.38725 7.66896 9.7567L11.9638 13.622L16.2929 9.29289Z"
				fill="white"
			/>
		</g>
		<defs>
			<clipPath id="clip0_353_2878">
				<rect width="24" height="24" fill="white" />
			</clipPath>
		</defs>
	</svg>
)

type HistoryToolbarProps = {
	length: number
	onLength: (length: number) => void
	search: string
	onSearch: (search: string) => void
	range: EwalletHistoryDateRange
	onRange: (range: EwalletHistoryDateRange) => void
	filters: EwalletHistoryFilters
	onFilters: (filters: EwalletHistoryFilters) => void
	filterOpen: boolean
	onToggleFilter: () => void
	exporting: boolean
	onExport: () => void
}

const HistoryToolbar = ({
	length,
	onLength,
	search,
	onSearch,
	range,
	onRange,
	filters,
	onFilters,
	filterOpen,
	onToggleFilter,
	exporting,
	onExport,
}: HistoryToolbarProps): JSX.Element => (
	// `.row.mt-2.mb-2`
	<div className="mx-[-15px] mt-[8px] mb-[8px] flex flex-wrap">
		{/* `.col-md-2` > `.mb-2.tbr_w-md-75px` */}
		<div className="w-full px-[15px] min-[768px]:w-1/6">
			<div className="mb-[8px] min-[768px]:w-[75px]">
				<LegacySelect
					value={String(length)}
					options={ENTRY_OPTIONS}
					onChange={(value) => onLength(Number(value))}
					className="flex w-full rounded-[5px]"
				/>
			</div>
		</div>

		{/* `.col` > `.row.justify-content-end` */}
		<div className="w-full min-w-0 flex-1 basis-0 px-[15px] max-[767px]:min-w-full">
			<div className="mx-[-15px] flex flex-wrap justify-end">
				<div className="w-full px-[15px] min-[768px]:w-5/12 min-[992px]:px-0">
					<input
						type="search"
						value={search}
						placeholder="Search"
						onChange={(event) => onSearch(event.target.value)}
						className="mb-[8px] block h-[40px] w-full rounded-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[16px] py-[6px] text-[12px] leading-[22.2px] text-[var(--body-txt-inverse)] outline-none placeholder:text-[var(--grey)] focus:border-[var(--secondary)]! [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
					/>
				</div>
				<div className="w-full px-[15px] min-[768px]:w-1/2">
					{/* `.tbr_report_input.w-100.px-0.mb-0` > `.form-group` (margin 0 in this theme) */}
					<LegacyDateRange from={range.from} to={range.to} onChange={(from, to) => onRange({ from, to })} />
				</div>
			</div>
		</div>

		{/* `.col-md-auto.d-flex.justify-content-end.mb-2.pl-0` */}
		<div className="mb-[8px] flex w-full shrink-0 justify-end px-[15px] pl-0 min-[768px]:w-auto">
			<button
				type="button"
				id="filter-button"
				className={legacyButtonClass("light-primary", cn(LIGHT_WARNING, "mr-[15px] inline-flex p-[8px]"))}
				onClick={(event) => {
					// `event.stopPropagation()` — the document's `.card-body` click would hide it again
					event.stopPropagation()
					onToggleFilter()
				}}
			>
				<FilterIcon />
			</button>
			{/* `#content-filter.card.tbr_card.tbr_advanced--filter` — `fadeToggle(200)` */}
			<div
				className={cn(
					"absolute top-[58px] right-0 z-[9] w-full min-[769px]:right-[85px] min-[769px]:w-[272px]",
					!filterOpen && "hidden",
				)}
				onClick={(event) => event.stopPropagation()}
			>
				<LegacyCard bodyClassName="p-[20px]">
					<div className="mb-[16px]">
						<LegacySelect
							value={filters.status}
							options={STATUS_OPTIONS}
							onChange={(status) => onFilters({ ...filters, status })}
							className="flex w-full"
						/>
					</div>
					<div className="mb-[16px]">
						<LegacySelect
							value={filters.type}
							options={TYPE_OPTIONS}
							onChange={(type) => onFilters({ ...filters, type })}
							className="flex w-full"
						/>
					</div>
				</LegacyCard>
			</div>
			<LegacyButton variant="info" className="inline-flex px-[20px]" loading={exporting} onClick={onExport}>
				<span className="inline-flex items-center">
					<ExportIcon />
					<span className="ml-[8px]">Export</span>
				</span>
			</LegacyButton>
		</div>
	</div>
)

export default HistoryToolbar
