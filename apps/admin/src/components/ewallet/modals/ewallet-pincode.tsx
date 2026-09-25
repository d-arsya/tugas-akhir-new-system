import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type JSX } from "react"

import { cn } from "@roja/utils"

// `PincodeInput` (pincode-input@0.4.2) as validate-pin.js / reset-pin.js configure it:
// `{ count: 6, secure: true, previewDuration: 200 }`, numeric, styled by `.tbr_pincode` (app.css 3493-3524).
// Behaviour transcribed from the library source: a cell takes one digit (anything else empties it), shows it
// for 200 ms and then turns into a password dot, the next cell is focused and selected, Backspace on an empty
// cell steps back, and any key but the arrows / Backspace / Delete turns the cell back to plain text.
const COUNT = 6
const PREVIEW_MS = 200

export type EwalletPincodeHandle = {
	/** `resetPincodeInput`: empties every cell and focuses the first. */
	reset: () => void
}

type EwalletPincodeProps = {
	id: string
	className?: string
	autoFocus?: boolean
	onInput: (value: string) => void
}

const EwalletPincode = forwardRef<EwalletPincodeHandle, EwalletPincodeProps>(
	({ id, className, autoFocus = false, onInput }, ref): JSX.Element => {
		const [values, setValues] = useState<string[]>(() => Array<string>(COUNT).fill(""))
		const [secret, setSecret] = useState<boolean[]>(() => Array<boolean>(COUNT).fill(false))
		const cells = useRef<Array<HTMLInputElement | null>>([])
		const focusedIndex = useRef(0)
		const timers = useRef<number[]>([])
		const latest = useRef<string[]>(values)

		useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

		const write = useCallback(
			(next: string[]): void => {
				latest.current = next
				setValues(next)
				onInput(next.join(""))
			},
			[onInput],
		)

		const focusCell = (index: number): void => {
			const cell = cells.current[index]
			if (!cell) return
			cell.focus()
			cell.select()
			focusedIndex.current = index
		}

		useImperativeHandle(ref, () => ({
			reset: () => {
				write(Array<string>(COUNT).fill(""))
				cells.current[0]?.focus()
				focusedIndex.current = 0
			},
		}))

		// validate-pin.js: `$("#tbr_ewallet_pin .pincode-input:first-child").trigger('focus')`
		useEffect(() => {
			if (autoFocus) cells.current[0]?.focus()
		}, [autoFocus])

		const onChange = (index: number, raw: string): void => {
			const next = [...latest.current]
			if (!/^\d$/.test(raw)) {
				next[index] = ""
				write(next)
				return
			}
			next[index] = raw
			write(next)
			timers.current.push(
				window.setTimeout(() => {
					setSecret((current) => current.map((value, at) => (at === index ? true : value)))
				}, PREVIEW_MS),
			)
			if (focusedIndex.current !== COUNT - 1) focusCell(focusedIndex.current + 1)
		}

		const onKeyDown = (index: number, key: string, preventDefault: () => void): void => {
			if (key === "ArrowLeft" && focusedIndex.current) focusCell(focusedIndex.current - 1)
			if (key === "ArrowRight" && focusedIndex.current !== COUNT - 1) focusCell(focusedIndex.current + 1)
			if (key === "Backspace" && !(latest.current[index] ?? "").length && focusedIndex.current) {
				focusCell(focusedIndex.current - 1)
				preventDefault()
			}
			if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Backspace", "Delete"].includes(key)) {
				setSecret((current) => current.map((value, at) => (at === index ? false : value)))
			}
		}

		return (
			// `.tbr_pincode`: 300px wide below 460px, full width above
			<div id={id} className={cn("flex w-[300px] flex-wrap justify-center min-[460px]:w-full", className)}>
				{values.map((value, index) => (
					<input
						key={index}
						ref={(element) => {
							cells.current[index] = element
						}}
						type={secret[index] ? "password" : "text"}
						inputMode="numeric"
						autoComplete="off"
						value={value}
						onChange={(event) => onChange(index, event.target.value)}
						onKeyDown={(event) => onKeyDown(index, event.key, () => event.preventDefault())}
						onFocus={() => {
							focusedIndex.current = index
						}}
						// `.pincode-input`: 2px #F3F4F6 border, 10px radius, 40x40, 14px, centred; `--focused` (#A9D256, no outline) is the :focus state
						className={cn(
							"h-[40px] w-[40px] rounded-[10px] border-2 bg-white p-0 text-center text-[14px] leading-normal! text-black outline-none",
							"border-[#F3F4F6] focus:border-[#A9D256]",
							index !== COUNT - 1 && "mr-[10px]",
						)}
					/>
				))}
			</div>
		)
	},
)
EwalletPincode.displayName = "EwalletPincode"

export default EwalletPincode
