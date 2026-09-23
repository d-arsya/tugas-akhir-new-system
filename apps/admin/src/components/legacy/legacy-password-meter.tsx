import type { JSX } from "react"

import LegacyCheckbox from "./legacy-checkbox"

const LOWER = /[a-z]/
const UPPER = /[A-Z]/
const DIGIT = /[0-9]/
// The legacy class, `/[-!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/\\\\/]/`
const SYMBOL = /[-!@#$%^&*()_+|~=`{}[\]:";'<>?,./\\]/

/**
 * Port of `public/assets/js/password-meter.js`: 3 needs 8+ characters with all four classes,
 * 2 needs 8+ characters with any two of them, 1 is any character from any class.
 */
export const passwordStrength = (password: string): 0 | 1 | 2 | 3 => {
	const classes = [LOWER, UPPER, DIGIT, SYMBOL].filter((pattern) => pattern.test(password)).length
	if (password.length >= 8 && classes === 4) return 3
	if (password.length >= 8 && classes >= 2) return 2
	if (classes >= 1) return 1
	return 0
}

// `displayBar()` — width, colour, label and the `.tbr_ps_*` shadow (app.css 2827-2855)
const BAR = {
	1: { width: "33%", background: "#F8374B", shadow: "0px 8px 10px 0px rgba(248,55,75,0.25)", label: "Lemah" },
	2: { width: "66%", background: "#FFA800", shadow: "0px 8px 10px 0px rgba(255,168,0,0.25)", label: "Sedang" },
	3: { width: "100%", background: "#28AF52", shadow: "0px 8px 10px 0px rgba(40,175,82,0.25)", label: "Kuat" },
} as const

type LegacyPasswordMeterProps = {
	password: string
	weakConfirmed: boolean
	onWeakConfirmedChange: (value: boolean) => void
	// Legacy renders the bar under `#password` and the checkbox under `#password_confirmation`
	part?: "bar" | "checkbox"
	/** Profil Saya keeps the "pasword" typo of `password-meter.js`; Buat Password spells it out. */
	weakLabel?: string
}

const LegacyPasswordMeter = ({
	password,
	weakConfirmed,
	onWeakConfirmedChange,
	part = "bar",
	weakLabel = "Anda yakin ingin melanjutkan dengan pasword lemah?",
}: LegacyPasswordMeterProps): JSX.Element | null => {
	const strength = passwordStrength(password)

	// `addCheckbox()` / `removeCheckbox()` — only a weak password asks for the confirmation
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

	// `#password-strength.strength` keeps `d-none` until the field has something in it
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
