import { useEffect, useRef, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { EwalletActiveFilter, EwalletOwnerType } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyInput from "@/components/legacy/legacy-input"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacySelect from "@/components/legacy/legacy-select"
import type { EwalletFilters } from "@/hooks/use-ewallets"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import type { TableState } from "@/lib/legacy-table"

import { ExportIcon, FilterIcon } from "./ewallet-icons"

// Legacy `ewallet/index.blade.php` 96-172 — the row above the table — and the `#filter-button`
// script at the foot of the page. The DataTables length/search row is hidden in legacy
// (`<"d-none"lf>`); these controls stand in for it (`ewallet-datatable-tools.js`).

const ENTRIES = ["10", "25", "50", "100"].map((value) => ({ value, label: value }))

const STATUS_OPTIONS: Array<{ value: EwalletActiveFilter | ""; label: string }> = [
	{ value: "", label: "Status E-Wallet" },
	{ value: "active", label: "Aktif" },
	{ value: "inactive", label: "Nonaktif" },
]

const MEMBER_OPTIONS: Array<{ value: EwalletOwnerType | ""; label: string }> = [
	{ value: "", label: "Pengguna" },
	{ value: "santri", label: "Santri" },
	{ value: "merchant", label: "Merchant" },
]

type EwalletToolbarProps = {
	state: TableState
	onStateChange: (state: TableState) => void
	filters: EwalletFilters
	onFiltersChange: (filters: EwalletFilters) => void
}

const EwalletToolbar = ({ state, onStateChange, filters, onFiltersChange }: EwalletToolbarProps): JSX.Element => {
	const [filterOpen, setFilterOpen] = useState(false)
	const [downloading, setDownloading] = useState(false)
	const panel = useRef<HTMLDivElement>(null)

	// `$(document).on("click", () => $("#content-filter").hide())`, with the panel itself and the
	// select2 dropdowns (rendered at the end of `<body>`) not counted as "outside"
	useEffect(() => {
		if (!filterOpen) return undefined
		const close = (event: MouseEvent): void => {
			const target = event.target as HTMLElement
			if (panel.current?.contains(target) || target.closest("[data-radix-popper-content-wrapper]")) return
			setFilterOpen(false)
		}
		document.addEventListener("click", close)
		return () => document.removeEventListener("click", close)
	}, [filterOpen])

	// The Export form is a plain GET in legacy (the browser downloads it); the API needs the bearer
	// token, so the workbook is fetched and saved instead.
	const download = async (): Promise<void> => {
		setDownloading(true)
		try {
			const { blob, fileName } = await adminApi.downloadEwalletBalanceReport({
				...(filters.status ? { status: filters.status } : {}),
				...(filters.member ? { member: filters.member } : {}),
			})
			saveBlob(blob, fileName ?? "Laporan Saldo Akhir.xlsx")
		} catch {
			legacyNotify.error("Terjadi kesalahan pada sistem. Silakan reload ulang halaman ini.")
		} finally {
			setDownloading(false)
		}
	}

	return (
		<div className="mx-[-15px] my-[8px] flex flex-wrap">
			{/* `.col-md-2 > .mb-2.tbr_w-md-75px` */}
			<div className="w-full px-[15px] min-[768px]:w-1/6">
				<div className="mb-[8px] min-[760px]:w-[75px]!">
					<LegacySelect
						value={String(state.length)}
						options={ENTRIES}
						searchable={false}
						onChange={(value) => onStateChange({ ...state, length: Number(value), page: 1 })}
					/>
				</div>
			</div>

			{/* `.col > .row.justify-content-end > .col-md-6 > input.form-control.mb-2` */}
			<div className="w-full min-w-0 flex-1 basis-0 px-[15px]">
				<div className="mx-[-15px] flex flex-wrap justify-end">
					<div className="w-full px-[15px] min-[768px]:w-1/2">
						<LegacyInput
							type="text"
							name="search_filter_ewallet"
							placeholder="Search"
							value={state.search}
							onChange={(event) => onStateChange({ ...state, search: event.target.value, page: 1 })}
							className="mb-[8px]"
						/>
					</div>
				</div>
			</div>

			{/* `.col-md-auto.d-flex.justify-content-end.mb-2.pl-0` */}
			<div className="flex w-full justify-end px-[15px] pl-0 min-[768px]:w-auto max-[767px]:pl-[15px] mb-[8px]">
				<button
					type="button"
					aria-label="Filter"
					onClick={(event) => {
						event.stopPropagation()
						setFilterOpen((open) => !open)
					}}
					className={legacyButtonClass(
						"light",
						// `.tbr_btn-light-warning`: orange at 16%, solid on hover, where `.tbr_btn:hover svg path` turns white
						"mr-[15px] inline-flex bg-[rgba(255,168,0,0.16)] p-[8px] text-[var(--warning)] hover:bg-[var(--warning)] hover:text-white focus:bg-[var(--warning)] focus:text-white [&:hover_path]:fill-white [&:focus_path]:fill-white",
					)}
				>
					<FilterIcon />
				</button>

				{/* `#content-filter.card.tbr_card.tbr_advanced--filter`, pinned to the page card */}
				{filterOpen ? (
					<div
						ref={panel}
						onClick={(event) => event.stopPropagation()}
						className="absolute top-[58px] right-[85px] z-[9] w-[272px] max-[768px]:right-0 max-[768px]:w-full"
					>
						<LegacyCard bodyClassName="p-[20px]">
							<div className="mb-[16px]">
								<LegacySelect
									value={filters.status}
									options={STATUS_OPTIONS}
									onChange={(value) => onFiltersChange({ ...filters, status: value as EwalletActiveFilter | "" })}
									className="w-full"
								/>
							</div>
							<div className="mt-[16px]">
								<LegacySelect
									value={filters.member}
									options={MEMBER_OPTIONS}
									onChange={(value) => onFiltersChange({ ...filters, member: value as EwalletOwnerType | "" })}
									className="w-full"
								/>
							</div>
						</LegacyCard>
					</div>
				) : null}

				<button
					type="button"
					onClick={() => {
						if (!downloading) void download()
					}}
					aria-disabled={downloading}
					className={cn(legacyButtonClass("info", "mr-[15px] inline-flex px-[20px]"), "aria-disabled:cursor-progress aria-disabled:opacity-65")}
				>
					<ExportIcon />
					<div className="ml-[8px]">Export</div>
				</button>

				{/* No `target="_blank"`: the print-all page replaces this one */}
				<Link to="/ewallets/qr-all" className={legacyButtonClass("danger", "inline-flex")}>
					Download QR
				</Link>
			</div>
		</div>
	)
}

export default EwalletToolbar
