"use client"

import * as React from "react"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { format, isValid, parseISO, parse } from "date-fns"
import type { DateRange } from "react-day-picker"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@roja/utils"
import { Calendar, createSafeDate } from "./calendar"

export type { DateRange }

export interface DatePickerSingleProps {
	mode?: "single"
	value?: Date | string | null | undefined
	onValueChange?: ((date: Date | undefined, formattedString: string) => void) | undefined
	onChange?: ((date: Date | undefined) => void) | undefined
}

export interface DatePickerRangeProps {
	mode: "range"
	value?: DateRange | { from?: Date | string | null; to?: Date | string | null } | null | undefined
	onValueChange?: ((range: DateRange | undefined, formattedString: string) => void) | undefined
	onChange?: ((range: DateRange | undefined) => void) | undefined
}

export type DatePickerProps = (DatePickerSingleProps | DatePickerRangeProps) & {
	placeholder?: string | undefined
	formatStr?: string | undefined
	className?: string | undefined
	triggerClassName?: string | undefined
	contentClassName?: string | undefined
	disabled?: boolean | undefined
	modal?: boolean | undefined
	clearable?: boolean | undefined
	minDate?: Date | undefined
	maxDate?: Date | undefined
}

export function parseDateValue(val: any, formatStr?: string): Date | undefined {
	if (!val) return undefined
	if (val instanceof Date) return isValid(val) ? val : undefined
	if (typeof val === "string") {
		// 1. Try ISO parsing (e.g. 2005-08-15)
		const iso = parseISO(val)
		if (isValid(iso)) return iso

		// 2. Try custom formatStr if provided
		if (formatStr) {
			const parsed = parse(val, formatStr, new Date())
			if (isValid(parsed)) return parsed
		}

		// 3. Try standard formats
		const parsedYmd = parse(val, "yyyy-MM-dd", new Date())
		if (isValid(parsedYmd)) return parsedYmd

		const parsedDmy = parse(val, "dd/MM/yyyy", new Date())
		if (isValid(parsedDmy)) return parsedDmy

		// 4. Fallback Date.parse
		const timestamp = Date.parse(val)
		if (!isNaN(timestamp)) {
			const d = new Date(timestamp)
			if (isValid(d)) return d
		}
	}
	return undefined
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
	(
		{
			placeholder,
			formatStr = "dd/MM/yyyy",
			className,
			triggerClassName,
			contentClassName,
			disabled = false,
			modal = false,
			clearable = true,
			minDate,
			maxDate,
			...props
		},
		ref,
	) => {
		const isRange = props.mode === "range"
		const [open, setOpen] = React.useState<boolean>(false)

		// Parse single value
		const singleDateValue: Date | undefined = React.useMemo(() => {
			if (isRange) return undefined
			const val = (props as DatePickerSingleProps).value
			return parseDateValue(val, formatStr)
		}, [isRange, props, formatStr])

		// Parse range value
		const rangeDateValue: DateRange | undefined = React.useMemo(() => {
			if (!isRange) return undefined
			const val = (props as DatePickerRangeProps).value
			if (!val) return undefined

			const from = parseDateValue(val.from, formatStr)
			const to = parseDateValue(val.to, formatStr)

			if (!from && !to) return undefined
			return { from, to }
		}, [isRange, props, formatStr])

		// Format display string
		const displayValue = React.useMemo(() => {
			if (isRange) {
				if (!rangeDateValue?.from) return ""
				const fromStr = format(rangeDateValue.from, formatStr)
				if (!rangeDateValue.to) return `${fromStr} - ...`
				const toStr = format(rangeDateValue.to, formatStr)
				return `${fromStr} - ${toStr}`
			}

			if (singleDateValue) {
				return format(singleDateValue, formatStr)
			}

			return ""
		}, [isRange, rangeDateValue, singleDateValue, formatStr])

		const handleSingleSelect = (date: Date | undefined) => {
			const formatted = date ? format(date, "yyyy-MM-dd") : ""
			if (!isRange) {
				const singleProps = props as DatePickerSingleProps
				if (singleProps.onValueChange) singleProps.onValueChange(date, formatted)
				if (singleProps.onChange) singleProps.onChange(date)
			}
			setOpen(false)
		}

		const handleRangeSelect = (range: DateRange | undefined) => {
			if (isRange) {
				const rangeProps = props as DatePickerRangeProps
				const formatted =
					range?.from && range?.to
						? `${format(range.from, "yyyy-MM-dd")} - ${format(range.to, "yyyy-MM-dd")}`
						: range?.from
							? format(range.from, "yyyy-MM-dd")
							: ""
				if (rangeProps.onValueChange) rangeProps.onValueChange(range, formatted)
				if (rangeProps.onChange) rangeProps.onChange(range)

				if (range?.from && range?.to) {
					setOpen(false)
				}
			}
		}

		const handleClear = (e: React.MouseEvent) => {
			e.stopPropagation()
			if (isRange) {
				const rangeProps = props as DatePickerRangeProps
				if (rangeProps.onValueChange) rangeProps.onValueChange(undefined, "")
				if (rangeProps.onChange) rangeProps.onChange(undefined)
			} else {
				const singleProps = props as DatePickerSingleProps
				if (singleProps.onValueChange) singleProps.onValueChange(undefined, "")
				if (singleProps.onChange) singleProps.onChange(undefined)
			}
		}

		const defaultPlaceholder = isRange ? "Pilih rentang tanggal..." : "Pilih tanggal..."

		return (
			<PopoverPrimitive.Root open={open} onOpenChange={setOpen} modal={modal}>
				<PopoverPrimitive.Trigger asChild>
					<div
						ref={ref}
						role="button"
						tabIndex={0}
						aria-expanded={open}
						className={cn(
							"group flex h-10 w-full items-stretch rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#17283c] overflow-hidden cursor-pointer transition-all hover:border-[#8dc31e]/50 dark:hover:border-[#8dc31e]/50",
							open && "!border-[#8dc31e] ring-0",
							disabled && "pointer-events-none opacity-50 bg-slate-50 dark:bg-slate-900",
							triggerClassName || className,
						)}
					>
						{/* Calendar Icon Left Box */}
						<div
							className={cn(
								"flex items-center justify-center px-3.5 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 transition-colors",
								(open || displayValue) && "bg-[#8dc31e]/10 text-[#8dc31e] border-r-[#8dc31e]/30",
							)}
						>
							<CalendarIcon
								className={cn(
									"h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-[#8dc31e] transition-colors",
									(open || displayValue) && "text-[#8dc31e] dark:text-[#8dc31e]",
								)}
							/>
						</div>

						{/* Text Display */}
						<div className="flex flex-1 items-center px-3 text-xs md:text-sm font-medium overflow-hidden">
							<span
								className={cn(
									"truncate",
									displayValue
										? "text-slate-800 dark:text-slate-100 font-semibold"
										: "text-slate-400 dark:text-slate-500 font-normal",
								)}
							>
								{displayValue || placeholder || defaultPlaceholder}
							</span>
						</div>

						{/* Clear Button */}
						{clearable && displayValue && !disabled && (
							<div
								role="button"
								onClick={handleClear}
								className="flex items-center justify-center px-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
							>
								<X className="h-3.5 w-3.5" />
							</div>
						)}
					</div>
				</PopoverPrimitive.Trigger>

				<PopoverPrimitive.Portal>
					<PopoverPrimitive.Content
						align="start"
						sideOffset={6}
						style={{ zIndex: 99999 }}
						className={cn(
							"w-auto overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#17283c] p-3 text-slate-900 dark:text-slate-100 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
							contentClassName,
						)}
					>
						{isRange ? (
							<Calendar
								mode="range"
								selected={rangeDateValue}
								onSelect={handleRangeSelect}
								minDate={minDate}
								maxDate={maxDate}
								className="border-none p-0"
							/>
						) : (
							<Calendar
								mode="single"
								selected={singleDateValue}
								onSelect={handleSingleSelect}
								minDate={minDate}
								maxDate={maxDate}
								className="border-none p-0"
							/>
						)}
					</PopoverPrimitive.Content>
				</PopoverPrimitive.Portal>
			</PopoverPrimitive.Root>
		)
	},
)

DatePicker.displayName = "DatePicker"

export default DatePicker
