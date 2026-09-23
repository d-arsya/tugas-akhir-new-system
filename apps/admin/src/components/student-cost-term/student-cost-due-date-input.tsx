import { useEffect, useRef, useState, type JSX } from "react"

import { cn } from "@roja/utils"

import LegacyDatepicker from "@/components/legacy/legacy-datepicker"
import { CalendarIcon } from "@/components/legacy/legacy-icons"
import { legacyControlClass } from "@/components/legacy/legacy-input"
import { formatDmy, parseDmy } from "@/lib/legacy-date"

type StudentCostDueDateInputProps = { value: string; onChange: (value: string) => void }

/**
 * `input#once_bill.form-control.time-span[data-plugin-datepicker]` with the calendar SVG in an
 * `.input-group-append.p-0` — `general.js` binds it with `{ format: "dd/mm/yyyy", language: "id" }`.
 *
 * No `autoclose` here, unlike the Tahun Ajaran KBM field, so bootstrap-datepicker keeps the
 * dropdown open after a pick and closes it on the next outside click. The value can also be
 * typed: legacy puts no key filter on this input, and the server validates `date_format:d/m/Y`.
 */
const StudentCostDueDateInput = ({ value, onChange }: StudentCostDueDateInputProps): JSX.Element => {
	const [open, setOpen] = useState(false)
	const wrapper = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return undefined
		const onMouseDown = (event: MouseEvent): void => {
			if (!wrapper.current?.contains(event.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", onMouseDown)
		return () => document.removeEventListener("mousedown", onMouseDown)
	}, [open])

	const picked = parseDmy(value)

	return (
		<div ref={wrapper} className="relative">
			{/* `.input-group.tbr_fix_ig` — the 42px append holds the calendar with no padding */}
			<div className="relative flex w-full flex-nowrap items-stretch">
				<input
					type="text"
					id="once_bill"
					name="once_bill"
					autoComplete="off"
					value={value}
					onFocus={() => setOpen(true)}
					onClick={() => setOpen(true)}
					onChange={(event) => onChange(event.target.value)}
					// `cn`, not a template string: twMerge has to drop the base `w-full` or the
					// `.input-group` wraps the calendar append onto its own line
					className={cn(legacyControlClass, "relative w-[1%] min-w-0 flex-auto rounded-r-none focus:z-[3]")}
				/>
				<span className="ml-[-2px] flex h-[40px] w-[42px] shrink-0 items-center justify-center rounded-r-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] p-0">
					<CalendarIcon />
				</span>
			</div>
			{open ? (
				<div
					onMouseDown={(event) => event.preventDefault()}
					className="absolute top-full left-0 z-[1020] mt-[10px] rounded-[10px] bg-[var(--bg-inverse)] p-[14px] text-[var(--body-txt-inverse)] shadow-[0px_18px_32px_0px_rgba(0,0,0,0.12)] after:absolute after:top-[-6px] after:left-[10px] after:border-x-[6px] after:border-b-[6px] after:border-x-transparent! after:border-b-[var(--bg-inverse)]! after:content-['']"
				>
					<LegacyDatepicker
						value={picked}
						range={[null, null]}
						initialView={picked ?? new Date()}
						onPick={(date) => onChange(formatDmy(date))}
					/>
				</div>
			) : null}
		</div>
	)
}

export default StudentCostDueDateInput
