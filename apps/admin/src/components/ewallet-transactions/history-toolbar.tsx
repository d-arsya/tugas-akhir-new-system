import type { JSX } from "react"

import { cn } from "@roja/utils"

import { ExportIcon, FilterIcon } from "@/components/ewallet/ewallet-icons"
import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyDateRange from "@/components/legacy/legacy-date-range"
import LegacySelect from "@/components/legacy/legacy-select"
import type { EwalletHistoryDateRange, EwalletHistoryFilters } from "@/hooks/use-ewallet-transactions"

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

const LIGHT_WARNING =
	"bg-[rgba(var(--warning-rgb),0.16)] text-[var(--warning)] hover:bg-[var(--warning)] hover:text-white focus:bg-[var(--warning)] focus:text-white active:bg-[var(--warning)] active:text-white"

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
	<div className="mx-[-15px] mt-[8px] mb-[8px] flex flex-wrap">
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
					<LegacyDateRange from={range.from} to={range.to} onChange={(from, to) => onRange({ from, to })} />
				</div>
			</div>
		</div>

		<div className="mb-[8px] flex w-full shrink-0 justify-end px-[15px] pl-0 min-[768px]:w-auto">
			<button
				type="button"
				id="filter-button"
				className={legacyButtonClass("light-primary", cn(LIGHT_WARNING, "mr-[15px] inline-flex p-[8px]"))}
				onClick={(event) => {
					event.stopPropagation()
					onToggleFilter()
				}}
			>
				<FilterIcon />
			</button>
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
