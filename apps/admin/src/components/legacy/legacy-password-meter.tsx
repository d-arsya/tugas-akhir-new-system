import type { JSX } from "react"

import LegacyCheckbox from "./legacy-checkbox"

const LOWER = /[a-z]/
const UPPER = /[A-Z]/
const DIGIT = /[0-9]/
const SYMBOL = /[-!@#$%^&*()_+|~=`{}[\]:";'<>?,./\\]/

export const passwordStrength = (password: string): 0 | 1 | 2 | 3 => {
	const classes = [LOWER, UPPER, DIGIT, SYMBOL].filter((pattern) => pattern.test(password)).length
	if (password.length >= 8 && classes === 4) return 3
	if (password.length >= 8 && classes >= 2) return 2
	if (classes >= 1) return 1
	return 0
}

const BAR = {
	1: { width: "33%", background: "#F8374B", shadow: "0px 8px 10px 0px rgba(248,55,75,0.25)", label: "Lemah" },
	2: { width: "66%", background: "#FFA800", shadow: "0px 8px 10px 0px rgba(255,168,0,0.25)", label: "Sedang" },
	3: { width: "100%", background: "#28AF52", shadow: "0px 8px 10px 0px rgba(40,175,82,0.25)", label: "Kuat" },
} as const

type LegacyPasswordMeterProps = {
	password: string
	weakConfirmed: boolean
	onWeakConfirmedChange: (value: boolean) => void
	part?: "bar" | "checkbox"
	weakLabel?: string
}

const LegacyPasswordMeter = ({
	password,
	weakConfirmed,
	onWeakConfirmedChange,
	part = "bar",
	// "pasword" is intentional: it matches the original page text
	weakLabel = "Anda yakin ingin melanjutkan dengan pasword lemah?",
}: LegacyPasswordMeterProps): JSX.Element | null => {
	const strength = passwordStrength(password)

	if (part === "checkbox") {
		if (strength !== 1) return null
		return (
			<div className="mb-[16px]">
				<LegacyCheckbox
					id="weak_password"
					name="weak_password"
					checked={weakConfirmed}
					onChange={onWeakConfirmedChange}
					label={weakLabel}
					className="mt-[16px]"
				/>
			</div>
		)
	}

	if (password === "") return null
	const bar = strength === 0 ? null : BAR[strength]

	return (
		<div className="mt-[10px] h-[20px] w-full rounded-[10px] bg-transparent transition-[height] duration-300">
			<span
				style={{ width: bar?.width ?? "0", background: bar?.background ?? "#E4007E", boxShadow: bar?.shadow }}
				className="block h-[20px] rounded-[6px] text-center text-[10px] tracking-[3px] text-white uppercase transition-[width] duration-300"
			>
				{bar?.label ?? ""}
			</span>
		</div>
	)
}

export default LegacyPasswordMeter
