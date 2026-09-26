import { useEffect, useRef, useState, type JSX } from "react"

import { cn } from "@roja/utils"

import LegacyDatepicker from "@/components/legacy/legacy-datepicker"
import { CalendarIcon } from "@/components/legacy/legacy-icons"
import { legacyControlClass, legacyControlLockedClass } from "@/components/legacy/legacy-input"
import { dayOf } from "@/lib/legacy-date"

import { INVALID_CLASS } from "./society-controls"

const pad = (n: number): string => String(n).padStart(2, "0")

export const ymdToDmy = (value: string): string => {
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
	return match ? `${match[3]}-${match[2]}-${match[1]}` : value
}

export const dmyToYmd = (value: string): string => {
	const match = /^\s*(\d{1,2})-(\d{1,2})-(\d{4})\s*$/.exec(value)
	return match ? `${match[3]}-${pad(Number(match[2]))}-${pad(Number(match[1]))}` : value
}

const parseYmd = (value: string): Date | null => {
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
	return match ? dayOf(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null
}

type SocietyDateInputProps = {
	name: string
	value: string
	onChange: (value: string) => void
	disabled?: boolean
	invalid?: boolean
}

const SocietyDateInput = ({ name, value, onChange, disabled, invalid }: SocietyDateInputProps): JSX.Element => {
	const [open, setOpen] = useState(false)
	const [text, setText] = useState(() => ymdToDmy(value))
	const wrapper = useRef<HTMLDivElement>(null)

	// Resync only when the value changes from outside; typing must not re-run this
	useEffect(() => {
		if (dmyToYmd(text) !== value) setText(ymdToDmy(value))
	}, [value])

	useEffect(() => {
		if (!open) return undefined
		const onMouseDown = (event: MouseEvent): void => {
			if (!wrapper.current?.contains(event.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", onMouseDown)
		return () => document.removeEventListener("mousedown", onMouseDown)
	}, [open])

	const type = (next: string): void => {
		setText(next)
		onChange(dmyToYmd(next))
	}

	const picked = parseYmd(value)

	return (
		<div ref={wrapper} className="relative">
			<div className="relative flex w-full flex-nowrap items-stretch">
				<input
					type="text"
					id={name}
					name={name}
					spellCheck={false}
					autoComplete="off"
					value={text}
					disabled={disabled === true}
					onFocus={() => setOpen(true)}
					onClick={() => setOpen(true)}
					onChange={(event) => type(event.target.value)}
					className={cn(
						legacyControlClass,
						"relative w-[1%] min-w-0 flex-auto rounded-r-none focus:z-[3]",
						disabled === true && legacyControlLockedClass,
						invalid === true && INVALID_CLASS,
					)}
				/>
				<span className="ml-[-2px] flex h-[40px] w-[42px] shrink-0 items-center justify-center rounded-r-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] p-0">
					<CalendarIcon />
				</span>
			</div>
			{open && disabled !== true ? (
				<div
					onMouseDown={(event) => event.preventDefault()}
					className="absolute top-full left-0 z-[1020] mt-[10px] rounded-[10px] bg-[var(--bg-inverse)] p-[14px] text-[var(--body-txt-inverse)] shadow-[0px_18px_32px_0px_rgba(0,0,0,0.12)] after:absolute after:top-[-6px] after:left-[10px] after:border-x-[6px] after:border-b-[6px] after:border-x-transparent! after:border-b-[var(--bg-inverse)]! after:content-['']"
				>
					<LegacyDatepicker
						value={picked}
						range={[null, null]}
						initialView={picked ?? new Date()}
						onPick={(date) => type(`${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`)}
					/>
				</div>
			) : null}
		</div>
	)
}

export default SocietyDateInput
