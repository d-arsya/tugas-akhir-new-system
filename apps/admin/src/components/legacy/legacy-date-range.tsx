import { Fragment, useEffect, useRef, useState, type JSX } from "react"

import { cn } from "@roja/utils"

import { formatDmy, parseDmy } from "@/lib/legacy-date"

import LegacyDatepicker from "./legacy-datepicker"

type Side = 0 | 1

type LegacyDateRangeProps = {
	// `dd/mm/yyyy` strings, "" when empty (the values legacy sends as `from` / `to`)
	from: string
	to: string
	onChange: (from: string, to: string) => void
	// `span.tbr_ig_center` between the two inputs ("Sampai" on the Pengumuman PSB form)
	middleLabel?: string
}

const CalendarIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<g opacity="0.5">
			<rect width="24" height="24" fill="#abb4be" opacity="0" />
			<path
				d="M18,4H17V3a1,1,0,0,0-2,0V4H9V3A1,1,0,0,0,7,3V4H6A3,3,0,0,0,3,7V19a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V7a3,3,0,0,0-3-3ZM6,6H7V7A1,1,0,0,0,9,7V6h6V7a1,1,0,0,0,2,0V6h1a1,1,0,0,1,1,1v4H5V7A1,1,0,0,1,6,6ZM18,20H6a1,1,0,0,1-1-1V13H19v6A1,1,0,0,1,18,20Z"
				fill="#abb4be"
			/>
			<circle cx="1" cy="1" r="1" transform="translate(7 15)" fill="#abb4be" />
			<path d="M16,15H12a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Z" fill="#abb4be" />
		</g>
	</svg>
)

// `.form-control` inside `.input-group.tbr_fix_ig`; the focused input sits above its neighbour (z-index 3)
const INPUT_CLASS =
	"relative h-[40px] w-0 min-w-0 flex-1 rounded-none border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[16px] py-[6px] text-center text-[12px] leading-[22.2px] text-[var(--body-txt-inverse)] outline-none focus:z-[3] focus:border-[var(--secondary)]!"

// Port of the legacy `.input-daterange` + bootstrap-datepicker (`format: "dd/mm/yyyy"`, `language: "id"`, no autoclose)
const LegacyDateRange = ({ from, to, onChange, middleLabel }: LegacyDateRangeProps): JSX.Element => {
	const [open, setOpen] = useState<Side | null>(null)
	// Text being typed; committed values come from props
	const [drafts, setDrafts] = useState<[string, string]>([from, to])
	const wrapper = useRef<HTMLDivElement>(null)
	const inputs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)] as const

	useEffect(() => setDrafts([from, to]), [from, to])

	// Hide on mousedown outside the inputs and the picker (bootstrap-datepicker behaviour)
	useEffect(() => {
		if (open === null) return undefined
		const onMouseDown = (event: MouseEvent): void => {
			if (!wrapper.current?.contains(event.target as Node)) setOpen(null)
		}
		document.addEventListener("mousedown", onMouseDown)
		return () => document.removeEventListener("mousedown", onMouseDown)
	}, [open])

	const dates: [Date | null, Date | null] = [parseDmy(from), parseDmy(to)]

	// DateRangePicker.dateUpdated: a start after the end moves the end, an end before the start moves the start
	const commit = (side: Side, date: Date | null): void => {
		const next: [Date | null, Date | null] = [...dates]
		next[side] = date
		if (date && side === 0 && next[1] && date > next[1]) next[1] = date
		if (date && side === 1 && next[0] && date < next[0]) next[0] = date
		onChange(formatDmy(next[0]), formatDmy(next[1]))
	}

	const onType = (side: Side, text: string): void => {
		setDrafts((current) => (side === 0 ? [text, current[1]] : [current[0], text]))
		const parsed = parseDmy(text)
		if (parsed && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text.trim())) commit(side, parsed)
	}

	// forceParse on blur: empty clears, anything unparseable falls back to the last valid date
	const onBlur = (side: Side): void => {
		const text = drafts[side].trim()
		if (text === "") commit(side, null)
		else commit(side, parseDmy(text) ?? dates[side])
	}

	return (
		<div ref={wrapper} className="relative">
			<div className="relative flex w-full flex-nowrap items-stretch">
				<span className="mr-[-2px] flex h-[40px] w-[42px] shrink-0 items-center justify-center rounded-l-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] p-0">
					<CalendarIcon />
				</span>
				{([0, 1] as const).map((side) => (
					<Fragment key={side}>
						{/* `.tbr_ig_center` (form.css 235-244): top and bottom borders only, 16px of padding */}
						{side === 1 && middleLabel !== undefined ? (
							<span className="flex items-center border-y-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[16px] text-[var(--grey)]">
								{middleLabel}
							</span>
						) : null}
						<input
							ref={inputs[side]}
							type="text"
							autoComplete="off"
							value={drafts[side]}
							onFocus={() => setOpen(side)}
							onClick={() => setOpen(side)}
							onChange={(event) => onType(side, event.target.value)}
							onBlur={() => onBlur(side)}
							onKeyDown={(event) => {
								if (event.key === "Escape" || event.key === "Tab") setOpen(null)
							}}
							className={cn(
								INPUT_CLASS,
								// `.tbr_last_input` (form.css 379-381); with no middle label the two inputs simply abut
								side === 1 && (middleLabel === undefined ? "ml-[-1px] rounded-r-[6px]" : "rounded-r-[6px]"),
							)}
						/>
					</Fragment>
				))}
			</div>
			{open !== null ? (
				<div
					// Keep focus in the input while clicking the calendar
					onMouseDown={(event) => event.preventDefault()}
					style={{ left: inputs[open].current?.offsetLeft ?? 0 }}
					className="absolute top-full z-[1020] mt-[10px] rounded-[10px] bg-[var(--bg-inverse)] p-[14px] text-[var(--body-txt-inverse)] shadow-[0px_18px_32px_0px_rgba(0,0,0,0.12)] after:absolute after:top-[-6px] after:left-[10px] after:border-x-[6px] after:border-b-[6px] after:border-x-transparent! after:border-b-[var(--bg-inverse)]! after:content-['']"
				>
					<LegacyDatepicker
						key={open}
						value={dates[open]}
						range={dates}
						initialView={dates[open] ?? new Date()}
						onPick={(date) => commit(open, date)}
					/>
				</div>
			) : null}
		</div>
	)
}

export default LegacyDateRange
