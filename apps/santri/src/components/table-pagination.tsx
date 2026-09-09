import type { JSX } from "react"
import { Button, SimpleSelect } from "@roja/ui"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface TablePaginationProps {
	page: number
	limit: number
	total: number
	totalPages: number
	onPageChange: (newPage: number) => void
	entriesValue?: number | undefined
	onEntriesChange?: ((newLimit: number) => void) | undefined
	entriesOptions?: number[] | undefined
}

export const TablePagination = ({
	page,
	limit,
	total,
	totalPages,
	onPageChange,
	entriesValue,
	onEntriesChange,
	entriesOptions = [10, 25, 50, 100],
}: TablePaginationProps): JSX.Element | null => {
	if (total <= 0 && totalPages <= 1) return null

	const currentLimit = entriesValue ?? limit
	const startItem = total === 0 ? 0 : (page - 1) * currentLimit + 1
	const endItem = Math.min(page * currentLimit, total)

	const getPageNumbers = () => {
		const pages: (number | string)[] = []
		if (totalPages <= 5) {
			for (let i = 1; i <= totalPages; i++) pages.push(i)
		} else {
			pages.push(1)
			if (page > 3) pages.push("...")
			const start = Math.max(2, page - 1)
			const end = Math.min(totalPages - 1, page + 1)
			for (let i = start; i <= end; i++) pages.push(i)
			if (page < totalPages - 2) pages.push("...")
			pages.push(totalPages)
		}
		return pages
	}

	const pageNumbers = getPageNumbers()

	const entriesSelectOptions = entriesOptions.map((n) => ({
		value: String(n),
		label: `${n}`,
	}))

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
			<div className="flex flex-wrap items-center gap-3">
				{onEntriesChange && (
					<div className="flex items-center gap-1.5">
						<span>Tampilkan</span>
						<SimpleSelect
							value={String(currentLimit)}
							onValueChange={(v) => onEntriesChange(Number(v))}
							options={entriesSelectOptions}
							triggerClassName="h-8 text-xs w-18"
						/>
						<span>data</span>
					</div>
				)}
				<div>
					Menampilkan <span className="font-semibold text-slate-700">{startItem}</span> -{" "}
					<span className="font-semibold text-slate-700">{endItem}</span> dari{" "}
					<span className="font-semibold text-slate-700">{total}</span> data
				</div>
			</div>

			<div className="flex items-center gap-1.5">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
					className="h-8.5 w-8.5 p-0 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
					aria-label="Halaman sebelumnya"
				>
					<ChevronLeft className="w-4 h-4" />
				</Button>

				{pageNumbers.map((p, idx) => {
					if (typeof p === "string") {
						return (
							<span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-medium">
								...
							</span>
						)
					}
					const isActive = p === page
					return (
						<button
							key={`page-${p}`}
							type="button"
							onClick={() => onPageChange(p)}
							className={`h-8.5 w-8.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
								isActive
									? "bg-[#e4007e] text-white shadow-sm shadow-pink-500/20"
									: "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80"
							}`}
						>
							{p}
						</button>
					)
				})}

				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}
					className="h-8.5 w-8.5 p-0 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
					aria-label="Halaman selanjutnya"
				>
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	)
}

export default TablePagination
