import { useEffect, useRef, useState, type JSX } from "react"

import LegacyDatepicker from "@/components/legacy/legacy-datepicker"
import { CalendarIcon } from "@/components/legacy/legacy-icons"
import { legacyControlClass } from "@/components/legacy/legacy-input"
import { digitsOnly } from "@/lib/digits-only"
import { dayOf } from "@/lib/legacy-date"

type AcademicYearKbmInputProps = { value: string; onChange: (value: string) => void }

const pad = (value: number): string => String(value).padStart(2, "0")

const formatDmyDash = (date: Date | null): string =>
	date ? `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}` : ""

const parseDmyDash = (value: string): Date | null => {
	const match = /^\s*(\d{1,2})-(\d{1,2})-(\d{4})\s*$/.exec(value)
	return match ? dayOf(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : null
}

const AcademicYearKbmInput = ({ value, onChange }: AcademicYearKbmInputProps): JSX.Element => {
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

	const picked = parseDmyDash(value)

	return (
		<div ref={wrapper} className="relative">
			<div className="relative flex w-full flex-nowrap items-stretch">
				<span className="mr-[-2px] flex h-[40px] w-[42px] shrink-0 items-center justify-center rounded-l-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] p-0">
					<CalendarIcon />
				</span>
				<input
					type="text"
					id="active_kbm"
					name="active_kbm"
					spellCheck={false}
					autoComplete="off"
					value={value}
					onKeyPress={digitsOnly}
					onFocus={() => setOpen(true)}
					onClick={() => setOpen(true)}
					onChange={(event) => onChange(event.target.value)}
					className={`${legacyControlClass} relative w-[1%] min-w-0 flex-auto rounded-l-none focus:z-[3]`}
				/>
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
						onPick={(date) => {
							onChange(formatDmyDash(date))
							setOpen(false)
						}}
					/>
				</div>
			) : null}
		</div>
	)
}

export default AcademicYearKbmInput
