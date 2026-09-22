import type { JSX } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@roja/ui"
import { cn } from "@roja/utils"

import { useLegacySelect, type LegacySelectOption } from "@/hooks/use-legacy-select"

// Legacy wrappers that restyle select2: `.tbr_summary_widget_filter` / `.tbr_chart_filter`
type LegacySelectVariant = "default" | "summary" | "chart"

type LegacySelectProps = {
	value: string
	options: LegacySelectOption[]
	onChange: (value: string) => void
	variant?: LegacySelectVariant
	// Legacy options with title="Select" (and similar) render the chosen text in grey
	mutedText?: boolean
	// select2 `minimumResultsForSearch: -1` (e.g. the DataTables length menu) hides the search box
	searchable?: boolean
	className?: string
}

// Border colours use "!" because globals.css sets border-color on every element outside any @layer
const TRIGGER_VARIANT: Record<LegacySelectVariant, { closed: string; open: string }> = {
	default: { closed: "border-[#eeeeee]!", open: "rounded-[5px] border-[var(--secondary)]!" },
	summary: { closed: "border-[var(--bg-inverse)]! bg-[var(--bg-inverse)]", open: "rounded-[5px] border-[var(--secondary)]!" },
	chart: {
		closed: "border-[var(--bg-form)]! shadow-[0px_8px_10px_rgba(171,180,190,0.25)]",
		open: "border-[var(--bg-form)]! shadow-[0px_8px_10px_rgba(171,180,190,0.25)]",
	},
}

// Port of the legacy select2 (bootstrap theme + public/assets/css/select2.css) with search box
const LegacySelect = ({
	value,
	options,
	onChange,
	variant = "default",
	mutedText = false,
	searchable = true,
	className,
}: LegacySelectProps): JSX.Element => {
	// Like a native <select> (which select2 wraps): an unknown value shows the first option
	const selected = options.find((o) => o.value === value) ?? options[0]
	const state = useLegacySelect(options, selected?.value ?? value, onChange)
	const styles = TRIGGER_VARIANT[variant]

	return (
		<Popover open={state.open} onOpenChange={state.setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={cn(
						"relative flex min-h-[40px] w-full cursor-pointer items-center justify-start rounded-[6px] border-2 bg-[var(--bg-form)] pt-[5px] pr-[12px] pb-[6px] pl-[12px] text-left text-[12px] outline-none",
						state.open ? styles.open : styles.closed,
						className,
					)}
				>
					<span
						className={cn(
							"block overflow-hidden text-ellipsis whitespace-nowrap",
							mutedText ? "text-[var(--grey)]" : "text-[var(--body-txt-inverse)]",
						)}
					>
						{selected?.label ?? ""}
					</span>
					{/* select2 positions the arrow from the border-less container: 7px outside = 5px inside our 2px border */}
					<span className="absolute top-[1px] right-[5px] bottom-0 my-auto h-[24px] w-[24px] bg-[var(--bg-form)] bg-[url('/assets/svg/icons/form_select_arrow.svg')] bg-center bg-no-repeat" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				sideOffset={3}
				className="w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[10px] border-0! bg-[var(--bg-inverse)] p-0 text-[12px] text-[var(--body-txt-inverse)] shadow-[0px_18px_32px_0px_rgba(0,0,0,0.12)] data-[state=closed]:animate-none data-[state=open]:animate-none"
			>
				{searchable ? (
					<div className="mb-[-12px] p-[12px]">
						<input
							value={state.search}
							onChange={(event) => state.setSearch(event.target.value)}
							onKeyDown={state.onSearchKeyDown}
							className="m-0 min-h-[38.39px] w-full rounded-[6px] border-0 bg-[#f4f7f0] px-[16px] text-[12px] shadow-none outline-none"
						/>
					</div>
				) : null}
				<ul
					role="listbox"
					tabIndex={-1}
					onKeyDown={searchable ? undefined : state.onSearchKeyDown}
					className="m-0 max-h-[200px] list-none overflow-y-auto p-[12px] outline-none"
				>
					{state.filtered.length === 0 ? (
						<li className="px-[16px] py-[8px]">No results found</li>
					) : (
						state.filtered.map((option) => {
							const isHighlighted = option.value === state.highlighted
							return (
								<li
									key={option.value}
									role="option"
									aria-selected={option.value === selected?.value}
									onMouseEnter={() => state.setHighlighted(option.value)}
									onClick={() => state.select(option.value)}
									className={cn(
										"mb-[4px] cursor-pointer rounded-[6px] px-[16px] py-[8px] select-none last:mb-0",
										option.value === selected?.value && "text-[var(--secondary)]",
										isHighlighted &&
											"bg-[var(--secondary)] text-white shadow-[0px_8px_10px_rgba(141,195,30,0.25)]",
									)}
								>
									{option.label}
								</li>
							)
						})
					)}
				</ul>
			</PopoverContent>
		</Popover>
	)
}

export default LegacySelect
