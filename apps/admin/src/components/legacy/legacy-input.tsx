import type { InputHTMLAttributes, JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

export const legacyControlClass =
	"block w-full min-h-[40px] rounded-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[16px] py-[6px] text-[12px] leading-[22.2px] tracking-[0.5px] text-[var(--body-txt-inverse)] shadow-none outline-none placeholder:text-[var(--grey)] focus:border-[var(--secondary)]! focus:bg-[var(--bg-inverse)]"

export const legacyControlLockedClass = "bg-[var(--bg-form-disabled)]! text-[var(--grey)]!"

const ADDON_CLASS =
	"flex items-center justify-center border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[12px] py-[4px] text-[var(--grey)]"

type LegacyInputProps = InputHTMLAttributes<HTMLInputElement> & { prepend?: ReactNode; append?: ReactNode }

const LegacyInput = ({ prepend, append, className, ...props }: LegacyInputProps): JSX.Element => {
	const locked = props.readOnly === true || props.disabled === true
	const grouped = prepend !== undefined || append !== undefined
	const input = (
		<input
			{...props}
			className={cn(
				legacyControlClass,
				locked && legacyControlLockedClass,
				grouped && "relative w-[1%] min-w-0 flex-auto focus:z-[3]",
				prepend !== undefined && "rounded-l-none",
				append !== undefined && "rounded-r-none",
				className,
			)}
		/>
	)
	if (!grouped) return input

	return (
		<div className="relative flex w-full flex-wrap items-stretch">
			{prepend !== undefined ? <span className={cn(ADDON_CLASS, "mr-[-2px] rounded-l-[6px]")}>{prepend}</span> : null}
			{input}
			{append !== undefined ? <span className={cn(ADDON_CLASS, "ml-[-2px] rounded-r-[6px]")}>{append}</span> : null}
		</div>
	)
}

export default LegacyInput
