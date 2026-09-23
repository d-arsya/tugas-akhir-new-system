import { useLayoutEffect, useRef, type JSX } from "react"

import { cn } from "@roja/utils"

import { maskWithCaret } from "@/lib/legacy-currency"

import { legacyControlClass } from "./legacy-input"

/**
 * The autoNumeric-masked rupiah field legacy uses for every cost amount
 * (`input.form-control.number-separator`). Thousands are grouped with dots as the user types,
 * and the caret is restored afterwards so typing mid-number does not jump to the end.
 *
 * Legacy renders it inside an `input-group` with an `Rp` prepend; pass that as `prefix`.
 */
type LegacyCurrencyInputProps = {
	/** Masked, e.g. "1.500.000". */
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

	// Restore the caret after React has written the re-masked value back
	useLayoutEffect(() => {
		if (nextCaret.current === null || !ref.current) return
		ref.current.setSelectionRange(nextCaret.current, nextCaret.current)
		nextCaret.current = null
	})

	return (
		<input
			ref={ref}
			// Legacy uses type=text: a number input would reject the thousands dots
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
