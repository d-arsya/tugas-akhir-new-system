import type { JSX } from "react"

import type { SocietyFieldErrors, SocietyValues } from "@roja/types"

import { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"

import { FieldError, INVALID_CLASS, StackedLabel } from "./society-controls"

// OWNER: AK-P. The "account" edit tab — `registrant/partials/edit/data/account.blade.php` and
// `student/partials/edit/data/account.blade.php` (identical markup; the registrant one disables the
// email and password inputs of a portal-registered row, never the status radios).

export type SocietyAccountValues = {
	email: string
	password: string
	password_confirmation: string
	/** `"0"` Active, `"1"` Deactive — posted as `is_blocked`. */
	is_blocked: string
}

export type SocietyAccountTabProps = {
	/** `SocietyAccountValues` (or any record holding those keys). */
	values: SocietyValues
	onChange: (name: keyof SocietyAccountValues, value: string) => void
	errors: SocietyFieldErrors
	/** PSB portal row (`registered_by_admin = 0`): email / password / confirmation disabled. */
	disabled?: boolean
}

// `span.help-block.tbr_text-grey` outside a label: porto's block help text (12px, 5px / 10px margins)
const HELP = "mt-[5px] mb-[10px] block text-[12px] text-[var(--grey)]"

const STATUS_OPTIONS = [
	{ value: "0", label: "Active", id: "active" },
	{ value: "1", label: "Deactive", id: "deactive" },
]

export default function SocietyAccountTab({ values, onChange, errors, disabled = false }: SocietyAccountTabProps): JSX.Element {
	const value = (name: keyof SocietyAccountValues): string => values[name] ?? ""
	const input = (name: "email" | "password" | "password_confirmation", type: "text" | "password"): JSX.Element => (
		<>
			<LegacyInput
				type={type}
				name={name}
				id={name}
				autoComplete="off"
				spellCheck={false}
				value={value(name)}
				disabled={disabled}
				onChange={(event) => onChange(name, event.target.value)}
				{...(errors[name] !== undefined ? { className: INVALID_CLASS } : {})}
			/>
			<FieldError message={errors[name]} />
		</>
	)

	return (
		<div>
			<div className="mb-[16px]">
				<StackedLabel htmlFor="email" label="Email" info="required" />
				{input("email", "text")}
			</div>

			<div className="mb-[16px]">
				<StackedLabel htmlFor="password" label="Password" info="optional" />
				{input("password", "password")}
				<span className={HELP}>
					Kosongkan jika tidak ingin mengganti password santri. Password harus mengandung minimal 8 karakter yang unik.
				</span>
			</div>

			<div className="mb-[16px]">
				<StackedLabel htmlFor="password_confirmation" label="Konfirmasi Password" info="optional" />
				{input("password_confirmation", "password")}
				<span className={HELP}>Kosongkan jika tidak ingin mengganti password santri.</span>
			</div>

			<LegacyCardTitle className="mt-[24px]!">Status</LegacyCardTitle>
			<LegacyCardText>Jika terjadi masalah pada santri. Misalnya dipulangkan dari pondok atau mengundurkan diri.</LegacyCardText>

			{/* `div.custom-control.custom-radio.custom-control-inline.mb-2` + `div.custom-control…inline` */}
			<LegacyRadioGroup
				inline
				name="is_blocked"
				value={value("is_blocked")}
				options={STATUS_OPTIONS}
				onChange={(next) => onChange("is_blocked", next)}
				className="block"
				itemClassName="mt-0 mb-[8px] mr-[16px] last:mb-0"
			/>
			<FieldError message={errors.is_blocked} />
		</div>
	)
}
