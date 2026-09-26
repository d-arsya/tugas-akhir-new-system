import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type JSX } from "react"

import { cn } from "@roja/utils"

const COUNT = 6
const PREVIEW_MS = 200

export type EwalletPincodeHandle = {
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
