import { type JSX, useState, useEffect } from "react"
import { Input, type InputProps } from "@roja/ui"
import { formatRupiah, parseRupiah } from "@roja/utils"

export interface RupiahInputProps extends Omit<InputProps, "onChange" | "value"> {
	value?: number
	onChange?: (value: number) => void
}

export const RupiahInput = ({
	value = 0,
	onChange,
	placeholder = "0",
	className = "",
	...props
}: RupiahInputProps): JSX.Element => {
	const [displayValue, setDisplayValue] = useState<string>(
		value > 0 ? value.toLocaleString("id-ID") : "",
	)

	useEffect(() => {
		if (value > 0) {
			setDisplayValue(value.toLocaleString("id-ID"))
		} else {
			setDisplayValue("")
		}
	}, [value])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawInput = e.target.value
		const numericVal = parseRupiah(rawInput)
		setDisplayValue(numericVal > 0 ? numericVal.toLocaleString("id-ID") : "")
		onChange?.(numericVal)
	}

	return (
		<div className="relative flex items-center w-full">
			<Input
				{...props}
				type="text"
				inputMode="numeric"
				value={displayValue}
				onChange={handleChange}
				placeholder={placeholder}
				className={`pl-9 font-mono text-xs font-bold ${className}`}
			/>
		</div>
	)
}

export default RupiahInput
