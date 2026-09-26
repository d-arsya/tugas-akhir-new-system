import { useLayoutEffect, useRef, type JSX } from "react"

import { cn } from "@roja/utils"

import { maskWithCaret } from "@/lib/legacy-currency"

import { legacyControlClass } from "./legacy-input"

type LegacyCurrencyInputProps = {
	value: string
	onChange: (masked: string) => void
	id?: string
	name?: string
	placeholder?: string
	disabled?: boolean
	className?: string
}

const LegacyCurrencyInput = ({
	value,
	onChange,
	id,
	name,
	placeholder,
	disabled = false,
	className,
}: LegacyCurrencyInputProps): JSX.Element => {
	const ref = useRef<HTMLInputElement>(null)
	const nextCaret = useRef<number | null>(null)

	useLayoutEffect(() => {
		if (nextCaret.current === null || !ref.current) return
		ref.current.setSelectionRange(nextCaret.current, nextCaret.current)
		nextCaret.current = null
	})

	return (
		<input
			ref={ref}
			type="text"
			inputMode="numeric"
			id={id}
			name={name}
			placeholder={placeholder}
			disabled={disabled}
			autoComplete="off"
			spellCheck={false}
			value={value}
			onChange={(event) => {
				const caret = event.target.selectionStart ?? event.target.value.length
				const masked = maskWithCaret(event.target.value, caret)
				nextCaret.current = masked.caret
				onChange(masked.value)
			}}
			className={cn(legacyControlClass, className)}
		/>
	)
}

export default LegacyCurrencyInput
