import { useState, type JSX, type ReactNode } from "react"

import { cn } from "@roja/utils"

import { DP_DAYS_MIN, DP_MONTHS, DP_MONTHS_SHORT, dayOf, monthGrid, sameDay } from "@/lib/legacy-date"

type View = "days" | "months" | "years"

type LegacyDatepickerProps = {
	// The picker's own date (`.active`)
	value: Date | null
	// Input-daterange endpoints: both get `.selected`, the days between get `.range`
	range: [Date | null, Date | null]
	initialView: Date
	onPick: (date: Date) => void
}

// Hover/selected colours come from public/assets/css/datepicker.css (all `!important` in legacy)
const CELL = "h-[32px] w-[32px] cursor-pointer p-[1px] text-center"
const HOVER = "hover:bg-[var(--secondary)] hover:text-white"
const SELECTED = "rounded-[5px] bg-[var(--secondary)] text-white"

const HeadCell = ({ children, className, onClick, colSpan }: { children: ReactNode; className?: string; onClick?: () => void; colSpan?: number }): JSX.Element => (
	<th colSpan={colSpan} onClick={onClick} className={cn(CELL, "rounded-[5px] text-[12.8px] font-semibold text-[var(--body-txt-inverse)]", HOVER, className)}>
		{children}
	</th>
)

// Port of the bootstrap-datepicker dropdown (datepicker3 + Porto + legacy datepicker.css), days/months/years views
const LegacyDatepicker = ({ value, range, initialView, onPick }: LegacyDatepickerProps): JSX.Element => {
	const [view, setView] = useState<View>("days")
	const [cursor, setCursor] = useState(() => dayOf(initialView.getFullYear(), initialView.getMonth(), 1))
	const year = cursor.getFullYear()
	const month = cursor.getMonth()
	const decade = Math.floor(year / 10) * 10

	const move = (step: number): void => {
		if (view === "days") setCursor(dayOf(year, month + step, 1))
		else if (view === "months") setCursor(dayOf(year + step, month, 1))
		else setCursor(dayOf(year + step * 10, month, 1))
	}

	const title = view === "days" ? `${DP_MONTHS[month]} ${year}` : view === "months" ? String(year) : `${decade}-${decade + 9}`
	const [start, end] = range

	const dayClass = (date: Date): string => {
		const outside = date.getMonth() !== month
		const selected = sameDay(date, start) || sameDay(date, end)
		const active = sameDay(date, value)
		const inRange = !!start && !!end && date > start && date < end
		return cn(
			CELL,
			"text-[12px] text-[var(--body-txt-inverse)]",
			outside && "text-[var(--grey)]",
			inRange ? "rounded-none bg-[#eeeeee] text-[var(--body-txt-color)]" : "rounded-[5px]",
			(selected || active) && SELECTED,
			HOVER,
		)
	}

	const spanClass = (active: boolean, muted: boolean): string =>
		cn(
			"float-left m-[1%] block h-[54px] w-[23%] cursor-pointer rounded-[4px] leading-[54px]",
			muted && "text-[var(--grey)]",
			active && "bg-[var(--secondary)] text-white",
			HOVER,
		)

	return (
		<table className="m-0 border-separate border-spacing-0 select-none text-[16px] leading-[17.6px]">
			<thead>
				<tr>
					<HeadCell className="text-[var(--grey)]" onClick={() => move(-1)}>
						«
					</HeadCell>
					<HeadCell colSpan={5} className="w-[160px]" onClick={() => setView(view === "days" ? "months" : "years")}>
						{title}
					</HeadCell>
					<HeadCell className="text-[var(--grey)]" onClick={() => move(1)}>
						»
					</HeadCell>
				</tr>
				{view === "days" ? (
					<tr>
						{DP_DAYS_MIN.map((day) => (
							<HeadCell key={day} className="font-normal">
								{day}
							</HeadCell>
						))}
					</tr>
				) : null}
			</thead>
			<tbody>
				{view === "days" ? (
					Array.from({ length: 6 }, (_, week) => (
						<tr key={week}>
							{monthGrid(year, month)
								.slice(week * 7, week * 7 + 7)
								.map((date) => (
									<td key={date.toDateString()} className={dayClass(date)} onClick={() => onPick(date)}>
										{date.getDate()}
									</td>
								))}
						</tr>
					))
				) : (
					<tr>
						<td colSpan={7} className="w-[224px] p-0 text-[12px] text-[var(--body-txt-inverse)]">
							{view === "months"
								? DP_MONTHS_SHORT.map((label, index) => (
										<span
											key={label}
											className={spanClass(!!value && value.getFullYear() === year && value.getMonth() === index, false)}
											onClick={() => {
												setCursor(dayOf(year, index, 1))
												setView("days")
											}}
										>
											{label}
										</span>
									))
								: Array.from({ length: 12 }, (_, i) => decade - 1 + i).map((y) => (
										<span
											key={y}
											className={spanClass(!!value && value.getFullYear() === y, y < decade || y > decade + 9)}
											onClick={() => {
												setCursor(dayOf(y, month, 1))
												setView("months")
											}}
										>
											{y}
										</span>
									))}
						</td>
					</tr>
				)}
			</tbody>
		</table>
	)
}

export default LegacyDatepicker
