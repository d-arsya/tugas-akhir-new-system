"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@roja/utils"

export type { DateRange }

export type CalendarViewMode = "days" | "months" | "years"

export interface CalendarProps {
	mode?: "single" | "range"
	selected?: Date | DateRange | undefined
	onSelect?: ((date: any) => void) | undefined
	month?: Date | undefined
	defaultMonth?: Date | undefined
	onMonthChange?: ((month: Date) => void) | undefined
	disabled?: ((date: Date) => boolean) | undefined
	className?: string | undefined
	showOutsideDays?: boolean | undefined
	minDate?: Date | undefined
	maxDate?: Date | undefined
}

const MONTH_NAMES_SHORT = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
]

const MONTH_NAMES_LONG = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
]

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function createSafeDate(year: number, month: number, day: number = 1): Date {
	const d = new Date()
	d.setFullYear(year, month, day)
	d.setHours(0, 0, 0, 0)
	return d
}

function isSameDay(d1: Date, d2: Date): boolean {
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
	)
}

function isDateInRange(date: Date, from?: Date, to?: Date): boolean {
	if (!from || !to) return false
	const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
	const f = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
	const t = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime()
	return d > f && d < t
}

export function Calendar({
	mode = "single",
	selected,
	onSelect,
	month: controlledMonth,
	defaultMonth,
	onMonthChange,
	disabled,
	className,
	showOutsideDays = true,
	minDate,
	maxDate,
}: CalendarProps) {
	// Initialize active month/year view
	const initialDate =
		controlledMonth ||
		defaultMonth ||
		(selected instanceof Date
			? selected
			: (selected as DateRange)?.from) ||
		new Date()

	const [viewDate, setViewDate] = React.useState<Date>(initialDate)
	const [viewMode, setViewMode] = React.useState<CalendarViewMode>("days")

	// Sync when selected date or controlledMonth changes
	React.useEffect(() => {
		if (controlledMonth) {
			setViewDate(controlledMonth)
		} else if (selected instanceof Date) {
			setViewDate(selected)
		} else if ((selected as DateRange)?.from) {
			setViewDate((selected as DateRange).from!)
		}
	}, [controlledMonth, selected])

	const currentYear = viewDate.getFullYear()
	const currentMonth = viewDate.getMonth()

	// Decade calculation for years view
	const decadeStart = Math.floor(currentYear / 10) * 10
	const decadeEnd = decadeStart + 9

	const changeViewDate = (newDate: Date) => {
		setViewDate(newDate)
		if (onMonthChange) {
			onMonthChange(newDate)
		}
	}

	// Navigation handlers
	const handlePrev = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (viewMode === "days") {
			changeViewDate(createSafeDate(currentYear, currentMonth - 1, 1))
		} else if (viewMode === "months") {
			changeViewDate(createSafeDate(currentYear - 1, currentMonth, 1))
		} else if (viewMode === "years") {
			changeViewDate(createSafeDate(decadeStart - 10, currentMonth, 1))
		}
	}

	const handleNext = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (viewMode === "days") {
			changeViewDate(createSafeDate(currentYear, currentMonth + 1, 1))
		} else if (viewMode === "months") {
			changeViewDate(createSafeDate(currentYear + 1, currentMonth, 1))
		} else if (viewMode === "years") {
			changeViewDate(createSafeDate(decadeStart + 10, currentMonth, 1))
		}
	}

	const handleTitleClick = () => {
		if (viewMode === "days") {
			setViewMode("months")
		} else if (viewMode === "months") {
			setViewMode("years")
		}
	}

	const handleMonthSelect = (monthIdx: number) => {
		changeViewDate(createSafeDate(currentYear, monthIdx, 1))
		setViewMode("days")
	}

	const handleYearSelect = (year: number) => {
		changeViewDate(createSafeDate(year, currentMonth, 1))
		setViewMode("months")
	}

	const handleDayClick = (dayDate: Date) => {
		if (!onSelect) return

		if (mode === "single") {
			onSelect(dayDate)
		} else if (mode === "range") {
			const currentRange = selected as DateRange | undefined
			if (!currentRange?.from || (currentRange.from && currentRange.to)) {
				onSelect({ from: dayDate, to: undefined })
			} else if (currentRange.from && !currentRange.to) {
				if (dayDate < currentRange.from) {
					onSelect({ from: dayDate, to: currentRange.from })
				} else {
					onSelect({ from: currentRange.from, to: dayDate })
				}
			}
		}
	}

	// Days calculation
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
	const firstDayOfWeek = createSafeDate(currentYear, currentMonth, 1).getDay()
	const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate()

	const calendarCells: Array<{ date: Date; isCurrentMonth: boolean }> = []

	// Previous month trailing days
	for (let i = firstDayOfWeek - 1; i >= 0; i--) {
		calendarCells.push({
			date: createSafeDate(currentYear, currentMonth - 1, prevMonthDaysCount - i),
			isCurrentMonth: false,
		})
	}

	// Current month days
	for (let i = 1; i <= daysInMonth; i++) {
		calendarCells.push({
			date: createSafeDate(currentYear, currentMonth, i),
			isCurrentMonth: true,
		})
	}

	// Next month leading days to complete 42 cells (6 rows)
	const remainingCells = 42 - calendarCells.length
	for (let i = 1; i <= remainingCells; i++) {
		calendarCells.push({
			date: createSafeDate(currentYear, currentMonth + 1, i),
			isCurrentMonth: false,
		})
	}

	// 12-year list for decade view (decadeStart - 1 to decadeEnd + 1)
	const decadeYears = Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i)

	// Header Title Text
	const headerTitle =
		viewMode === "days"
			? `${MONTH_NAMES_LONG[currentMonth]} ${currentYear}`
			: viewMode === "months"
				? `${currentYear}`
				: `${decadeStart}-${decadeEnd}`

	const today = new Date()

	return (
		<div className={cn("w-64 select-none p-1", className)}>
			{/* Header with Navigation and Switch Title */}
			<div className="flex items-center justify-between mb-3 px-1">
				<button
					type="button"
					onClick={handlePrev}
					className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#8dc31e] hover:bg-[#8dc31e]/15 transition-all cursor-pointer"
					title="Previous"
				>
					<ChevronLeft className="h-4 w-4 stroke-[2.5]" />
				</button>

				<button
					type="button"
					onClick={handleTitleClick}
					disabled={viewMode === "years"}
					className={cn(
"px-3 py-1 rounded-xl text-xs font-bold text-slate-800 transition-all",
						viewMode !== "years"
							? "hover:bg-[#8dc31e]/15 hover:text-[#8dc31e] cursor-pointer"
							: "cursor-default",
					)}
				>
					{headerTitle}
				</button>

				<button
					type="button"
					onClick={handleNext}
					className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#8dc31e] hover:bg-[#8dc31e]/15 transition-all cursor-pointer"
					title="Next"
				>
					<ChevronRight className="h-4 w-4 stroke-[2.5]" />
				</button>
			</div>

			{/* VIEW 1: DAYS */}
			{viewMode === "days" && (
				<div>
					{/* Weekday Labels */}
					<div className="grid grid-cols-7 gap-1 text-center mb-1">
						{WEEKDAY_NAMES.map((weekday) => (
							<div
								key={weekday}
								className="text-[11px] font-medium italic text-slate-400 h-6 flex items-center justify-center"
							>
								{weekday}
							</div>
						))}
					</div>

					{/* Days Grid */}
					<div className="grid grid-cols-7 gap-y-1">
						{calendarCells.map(({ date, isCurrentMonth }, idx) => {
							const isDisabled =
								(disabled && disabled(date)) ||
								(minDate && date < minDate) ||
								(maxDate && date > maxDate)

							const isToday = isSameDay(date, today)

							let isSelectedSingle = false
							let isRangeStart = false
							let isRangeEnd = false
							let isInRange = false

							if (mode === "single" && selected instanceof Date) {
								isSelectedSingle = isSameDay(date, selected)
							} else if (mode === "range" && selected && typeof selected === "object") {
								const range = selected as DateRange
								if (range.from) isRangeStart = isSameDay(date, range.from)
								if (range.to) isRangeEnd = isSameDay(date, range.to)
								if (range.from && range.to) isInRange = isDateInRange(date, range.from, range.to)
							}

							return (
								<button
									key={idx}
									type="button"
									disabled={isDisabled}
									onClick={() => !isDisabled && handleDayClick(date)}
									className={cn(
										"h-8 w-8 mx-auto flex items-center justify-center text-xs font-semibold rounded-xl transition-all cursor-pointer",
										!isCurrentMonth &&"opacity-35 text-slate-400",
										isCurrentMonth &&"text-slate-700",
										!isSelectedSingle &&
											!isRangeStart &&
											!isRangeEnd &&
											!isInRange &&
											!isDisabled &&
											"hover:bg-[#8dc31e]/15 hover:text-[#8dc31e]",
										isToday &&
											!isSelectedSingle &&
											!isRangeStart &&
											!isRangeEnd &&
											"font-bold text-[#8dc31e] underline decoration-2 underline-offset-2",
										isSelectedSingle &&
											"!bg-[#8dc31e] !text-white font-bold rounded-xl shadow-md shadow-[#8dc31e]/30",
										isRangeStart &&
											"!bg-[#8dc31e] !text-white font-bold rounded-l-xl rounded-r-none shadow-md shadow-[#8dc31e]/30",
										isRangeEnd &&
											"!bg-[#8dc31e] !text-white font-bold rounded-r-xl rounded-l-none shadow-md shadow-[#8dc31e]/30",
										isInRange &&
"!bg-[#8dc31e]/15 !text-[#4a6b0c] font-semibold !rounded-none",
										isDisabled && "pointer-events-none opacity-20 cursor-not-allowed",
									)}
								>
									{date.getDate()}
								</button>
							)
						})}
					</div>
				</div>
			)}

			{/* VIEW 2: MONTHS */}
			{viewMode === "months" && (
				<div className="grid grid-cols-4 gap-2 py-2">
					{MONTH_NAMES_SHORT.map((mName, mIdx) => {
						const isSelectedMonth =
							(selected instanceof Date &&
								selected.getFullYear() === currentYear &&
								selected.getMonth() === mIdx) ||
							((selected as DateRange)?.from &&
								(selected as DateRange).from!.getFullYear() === currentYear &&
								(selected as DateRange).from!.getMonth() === mIdx)

						return (
							<button
								key={mName}
								type="button"
								onClick={() => handleMonthSelect(mIdx)}
								className={cn(
									"h-10 text-xs font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer",
									isSelectedMonth
										? "!bg-[#8dc31e] !text-white font-bold shadow-md shadow-[#8dc31e]/30"
										:"text-slate-700 hover:bg-[#8dc31e]/15 hover:text-[#8dc31e]",
								)}
							>
								{mName}
							</button>
						)
					})}
				</div>
			)}

			{/* VIEW 3: YEARS */}
			{viewMode === "years" && (
				<div className="grid grid-cols-4 gap-2 py-2">
					{decadeYears.map((year) => {
						const isOutsideDecade = year < decadeStart || year > decadeEnd
						const isSelectedYear =
							(selected instanceof Date && selected.getFullYear() === year) ||
							((selected as DateRange)?.from &&
								(selected as DateRange).from!.getFullYear() === year)

						return (
							<button
								key={year}
								type="button"
								onClick={() => handleYearSelect(year)}
								className={cn(
									"h-10 text-xs font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer",
									isOutsideDecade &&"opacity-40 text-slate-400",
									!isOutsideDecade &&"text-slate-700",
									isSelectedYear
										? "!bg-[#8dc31e] !text-white font-bold shadow-md shadow-[#8dc31e]/30"
										: "hover:bg-[#8dc31e]/15 hover:text-[#8dc31e]",
								)}
							>
								{year}
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}

export default Calendar
