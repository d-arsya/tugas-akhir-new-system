"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@roja/utils"

export interface SearchableSelectOption {
	value: string | number
	label: React.ReactNode
	disabled?: boolean
	keywords?: string[]
}

export interface SearchableSelectProps {
	options: SearchableSelectOption[]
	value?: string | number | null
	onValueChange?: (value: string) => void
	placeholder?: string
	searchPlaceholder?: string
	emptyText?: string
	className?: string
	triggerClassName?: string
	contentClassName?: string
	disabled?: boolean
	name?: string
	id?: string
	modal?: boolean
}

export const SearchableSelect = React.forwardRef<HTMLButtonElement, SearchableSelectProps>(
	(
		{
			options = [],
			value,
			onValueChange,
			placeholder = "Pilih...",
			searchPlaceholder = "Cari opsi...",
			emptyText = "Tidak ditemukan.",
			className,
			triggerClassName,
			contentClassName,
			disabled = false,
			modal = false,
		},
		ref,
	) => {
		const [open, setOpen] = React.useState<boolean>(false)
		const [searchQuery, setSearchQuery] = React.useState<string>("")

		const stringValue = value !== undefined && value !== null ? String(value) : ""

		const selectedOption = React.useMemo(() => {
			return options.find((opt) => String(opt.value) === stringValue)
		}, [options, stringValue])

		const handleSelect = (val: string) => {
			if (onValueChange) {
				onValueChange(val)
			}
			setOpen(false)
			setSearchQuery("")
		}

		return (
			<PopoverPrimitive.Root open={open} onOpenChange={setOpen} modal={modal}>
				<PopoverPrimitive.Trigger asChild>
					<button
						ref={ref}
						type="button"
						role="combobox"
						aria-expanded={open}
						disabled={disabled}
						className={cn(
							"form-control flex h-10 w-full items-center justify-between cursor-pointer text-left transition-all",
							open && "!border-[#8dc31e]",
							triggerClassName || className,
						)}
					>
						<span className={cn("truncate block text-xs md:text-sm font-medium", !selectedOption && "text-slate-400")}>
							{selectedOption ? selectedOption.label : placeholder}
						</span>
						<ChevronDown className={cn("h-4 w-4 shrink-0 text-[#8dc31e] transition-transform duration-200 ml-2", open && "rotate-180")} />
					</button>
				</PopoverPrimitive.Trigger>

				<PopoverPrimitive.Portal>
					<PopoverPrimitive.Content
						align="start"
						sideOffset={4}
						style={{ width: "var(--radix-popover-trigger-width)", zIndex: 99999 }}
						className={cn(
							"w-[var(--radix-popover-trigger-width)] max-w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#17283c] p-2 text-slate-900 dark:text-slate-100 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
							contentClassName,
						)}
					>
						<CommandPrimitive
							className="flex h-full w-full flex-col overflow-hidden"
							shouldFilter={true}
						>
							{/* Search Input Container */}
							<div className="roja_search_input_container flex items-center rounded-xl px-3.5 py-2 mb-2 transition-all">

								<CommandPrimitive.Input
									value={searchQuery}
									onValueChange={setSearchQuery}
									placeholder={searchPlaceholder}
									className="flex h-7 w-full rounded-none border-0 border-none bg-transparent p-0 text-xs text-slate-800 dark:text-slate-100 outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:ring-0 focus-visible:outline-none shadow-none placeholder:text-slate-500/80 disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>

							{/* Option List */}
							<CommandPrimitive.List className="max-h-60 overflow-y-auto overflow-x-hidden space-y-1 pr-1">
								<CommandPrimitive.Empty className="py-6 text-center text-xs text-slate-400">
									{emptyText}
								</CommandPrimitive.Empty>

								{options.map((option) => {
									const optValueStr = String(option.value)
									const isSelected = Boolean(stringValue && optValueStr && optValueStr.toLowerCase() === stringValue.toLowerCase())

									// Ensure label text is string for cmdk search indexing
									const searchKeywords = typeof option.label === "string" ? [option.label] : []
									if (option.keywords) {
										searchKeywords.push(...option.keywords)
									}

									return (
										<CommandPrimitive.Item
											key={optValueStr}
											value={typeof option.label === "string" ? option.label : optValueStr}
											keywords={searchKeywords}
											disabled={option.disabled}
											onSelect={() => handleSelect(optValueStr)}
											className={cn(
												"relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition-all duration-150 text-slate-700 dark:text-slate-200",
												isSelected && "roja_item_selected",
												option.disabled && "pointer-events-none opacity-50",
											)}
										>
											<span className="truncate flex-1">{option.label}</span>
											{isSelected && <Check className="h-4 w-4 shrink-0 ml-2 text-white stroke-[2.5]" />}
										</CommandPrimitive.Item>
									)
								})}
							</CommandPrimitive.List>
						</CommandPrimitive>
					</PopoverPrimitive.Content>
				</PopoverPrimitive.Portal>
			</PopoverPrimitive.Root>
		)
	},
)

SearchableSelect.displayName = "SearchableSelect"

export default SearchableSelect
