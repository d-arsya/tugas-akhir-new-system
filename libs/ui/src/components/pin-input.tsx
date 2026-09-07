import type { JSX, KeyboardEvent, ClipboardEvent } from "react"
import { useRef, useEffect } from "react"

export interface PinInputProps {
	value: string
	onChange: (value: string) => void
	disabled?: boolean
	error?: boolean
	length?: number
	secure?: boolean
	className?: string
}

export const PinInput = ({
	value = "",
	onChange,
	disabled = false,
	error = false,
	length = 6,
	secure = true,
	className = "",
}: PinInputProps): JSX.Element => {
	const inputsRef = useRef<(HTMLInputElement | null)[]>([])

	useEffect(() => {
		// Auto focus first input on mount
		if (inputsRef.current[0] && !disabled) {
			inputsRef.current[0].focus()
		}
	}, [disabled])

	const digits = Array.from({ length }, (_, i) => value[i] || "")

	const handleChange = (index: number, val: string) => {
		if (disabled) return
		const digit = val.slice(-1)
		if (digit && !/^\d$/.test(digit)) return

		const newDigits = [...digits]
		newDigits[index] = digit
		const newValue = newDigits.join("")
		onChange(newValue)

		if (digit && index < length - 1) {
			inputsRef.current[index + 1]?.focus()
		}
	}

	const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
		if (disabled) return

		if (e.key === "Backspace") {
			if (!digits[index] && index > 0) {
				const newDigits = [...digits]
				newDigits[index - 1] = ""
				onChange(newDigits.join(""))
				inputsRef.current[index - 1]?.focus()
			} else {
				const newDigits = [...digits]
				newDigits[index] = ""
				onChange(newDigits.join(""))
			}
		} else if (e.key === "ArrowLeft" && index > 0) {
			inputsRef.current[index - 1]?.focus()
		} else if (e.key === "ArrowRight" && index < length - 1) {
			inputsRef.current[index + 1]?.focus()
		}
	}

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		if (disabled) return
		e.preventDefault()
		const pastedData = e.clipboardData.getData("text").trim()
		const numericData = pastedData.replace(/\D/g, "").slice(0, length)

		if (numericData) {
			onChange(numericData)
			const focusIndex = Math.min(numericData.length, length - 1)
			inputsRef.current[focusIndex]?.focus()
		}
	}

	return (
		<div className={`flex items-center justify-center gap-2 sm:gap-3 ${error ? "animate-shake" : ""} ${className}`}>
			{Array.from({ length }).map((_, index) => (
				<input
					key={index}
					ref={(el) => {
						inputsRef.current[index] = el
					}}
					type={secure ? "password" : "text"}
					inputMode="numeric"
					pattern="[0-9]*"
					maxLength={1}
					value={digits[index]}
					disabled={disabled}
					onChange={(e) => handleChange(index, e.target.value)}
					onKeyDown={(e) => handleKeyDown(index, e)}
					onPaste={handlePaste}
					className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border-2 transition-all outline-none shadow-sm ${
						error
							? "border-red-500 text-red-600 bg-red-50 focus:ring-2 focus:ring-red-200"
							: digits[index]
							? "border-[#e4007e] text-slate-800 bg-pink-50/20 focus:ring-2 focus:ring-[#e4007e]/30"
							: "border-slate-200 text-slate-800 bg-white hover:border-slate-300 focus:border-[#e4007e] focus:ring-2 focus:ring-[#e4007e]/20"
					} ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : ""}`}
					aria-label={`PIN box ${index + 1}`}
				/>
			))}
		</div>
	)
}

export default PinInput
