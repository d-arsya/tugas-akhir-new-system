"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@roja/utils"

export interface SimpleSelectOption {
	value: string | number
	label: React.ReactNode
	disabled?: boolean
}

export interface SimpleSelectProps {
	options: SimpleSelectOption[]
	value?: string | number | null | undefined
	onValueChange?: ((value: string) => void) | undefined
	placeholder?: string | undefined
	className?: string | undefined
	triggerClassName?: string | undefined
	contentClassName?: string | undefined
	disabled?: boolean | undefined
	name?: string | undefined
	id?: string | undefined
	modal?: boolean | undefined
}

export const SimpleSelect = React.forwardRef<HTMLButtonElement, SimpleSelectProps>(
	(
		{
			options = [],
			value,
			onValueChange,
			placeholder = "Pilih...",
			className,
			triggerClassName,
			contentClassName,
			disabled = false,
			modal = false,
		},
		ref,
	) => {
		const [open, setOpen] = React.useState<boolean>(false)

		const stringValue = value !== undefined && value !== null ? String(value) : ""

		const selectedOption = React.useMemo(() => {
			return options.find((opt) => String(opt.value) === stringValue)
		}, [options, stringValue])

		const handleSelect = (val: string) => {
			if (onValueChange) {
				onValueChange(val)
			}
			setOpen(false)
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
							"form-control flex h-10 w-full items-center justify-between cursor-pointer text-left transition-all rounded-xl",
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
"w-[var(--radix-popover-trigger-width)] max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
							contentClassName,
						)}
					>
						<div className="max-h-60 overflow-y-auto overflow-x-hidden space-y-1 pr-1">
							{options.map((option) => {
								const optValueStr = String(option.value)
								const isSelected = Boolean(stringValue && optValueStr && optValueStr.toLowerCase() === stringValue.toLowerCase())

								return (
									<div
										key={optValueStr}
										role="option"
										aria-selected={isSelected}
										onClick={() => !option.disabled && handleSelect(optValueStr)}
										className={cn(
"relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition-all duration-150 text-slate-700 hover:bg-slate-100",
											isSelected &&"bg-[#8dc31e]/15 text-[#8dc31e] font-semibold",
											option.disabled && "pointer-events-none opacity-50",
										)}
									>
										<span className="truncate flex-1">{option.label}</span>
										{isSelected && <Check className="h-4 w-4 shrink-0 ml-2 text-[#8dc31e] stroke-[2.5]" />}
									</div>
								)
							})}
						</div>
					</PopoverPrimitive.Content>
				</PopoverPrimitive.Portal>
			</PopoverPrimitive.Root>
		)
	},
)

SimpleSelect.displayName = "SimpleSelect"

export default SimpleSelect
