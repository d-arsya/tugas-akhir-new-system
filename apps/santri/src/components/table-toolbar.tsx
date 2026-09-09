import type { JSX } from "react"
import { Input, SimpleSelect } from "@roja/ui"

export interface TableToolbarFilter {
	value: string
	label: string
}

export interface TableToolbarProps {
	searchValue: string
	onSearchChange: (value: string) => void
	searchPlaceholder?: string | undefined
	filterValue?: string | undefined
	onFilterChange?: ((value: string) => void) | undefined
	filterOptions?: TableToolbarFilter[] | undefined
	filterPlaceholder?: string | undefined
	entriesValue?: number | undefined
	onEntriesChange?: ((value: number) => void) | undefined
	entriesOptions?: number[] | undefined
	className?: string | undefined
}

export const TableToolbar = ({
	searchValue,
	onSearchChange,
	searchPlaceholder = "Cari...",
	filterValue,
	onFilterChange,
	filterOptions = [],
	filterPlaceholder = "Semua Status",
	entriesValue,
	onEntriesChange,
	entriesOptions = [10, 25, 50],
	className = "",
}: TableToolbarProps): JSX.Element => {
	const filterSelectOptions = [
		{ value: "", label: "Semua" },
		...filterOptions.map((opt) => ({ value: opt.value, label: opt.label })),
	]

	const entriesSelectOptions = entriesOptions.map((n) => ({
		value: String(n),
		label: `${n} baris`,
	}))

	return (
		<div className={`flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between ${className}`}>
			<Input
				type="text"
				placeholder={searchPlaceholder}
				value={searchValue}
				onChange={(e) => onSearchChange(e.target.value)}
				className="h-9 max-w-xs text-xs"
			/>
			<div className="flex items-center gap-2">
				{filterOptions.length > 0 && onFilterChange && (
					<SimpleSelect
						value={filterValue ?? ""}
						onValueChange={onFilterChange}
						placeholder={filterPlaceholder}
						options={filterSelectOptions}
						triggerClassName="h-9 text-xs w-40"
					/>
				)}
				{onEntriesChange && (
					<SimpleSelect
						value={String(entriesValue ?? entriesOptions[0])}
						onValueChange={(v) => onEntriesChange(Number(v))}
						options={entriesSelectOptions}
						triggerClassName="h-9 text-xs w-28"
					/>
				)}
			</div>
		</div>
	)
}

export default TableToolbar
