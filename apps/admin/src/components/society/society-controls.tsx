import type { JSX, KeyboardEvent, ReactNode } from "react"

import { cn } from "@roja/utils"

import LegacyFormRow, { type LegacyCol } from "@/components/legacy/legacy-form-row"
import LegacyInput, { legacyControlClass, legacyControlLockedClass } from "@/components/legacy/legacy-input"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacySelect from "@/components/legacy/legacy-select"

// Building blocks of the legacy society form, shared by the edit tabs
// (`registrant/partials/edit/data/*.blade.php`, `layout="stacked"`) and the create wizard
// (`registrant/create/data/*.blade.php`, `layout="horizontal"`).

export type SocietyLayout = "stacked" | "horizontal"

/** `.form-control.is-invalid { border-color: var(--danger) !important }` (form.css 64-67) */
export const INVALID_CLASS = "border-[var(--danger)]! focus:border-[var(--danger)]!"

/** `span.invalid-feedback[role=alert]` (form.css 69-74 over bootstrap's 80% size) */
export const FieldError = ({ message, className }: { message: string | undefined; className?: string }): JSX.Element | null =>
	message ? (
		<span role="alert" className={cn("mt-[8px] block w-full text-[80%] leading-[18px] text-[var(--danger)]", className)}>
			{message}
		</span>
	) : null

type FrameProps = {
	layout: SocietyLayout
	htmlFor: string
	label: string
	info: "required" | "optional"
	/** Wizard `.col-lg-N` of the input column (6 for most fields). */
	fieldCols?: LegacyCol
	/** Edit `div.form-group` modifiers, e.g. `mb-[8px]` for `.form-group.mb-2`. */
	stackedClassName?: string
	children: ReactNode
}

/**
 * Edit: `div.form-group > label.control-label.text-lg-right.d-flex.m-0 {label}<span.help-block.ml-2>`.
 * Wizard: `div.form-group.row > label.col-lg-4.control-label.text-lg-right.m-0 {label}<span.help-block>` + `div.col-lg-6`.
 */
export const SocietyFrame = ({ layout, htmlFor, label, info, fieldCols = 6, stackedClassName, children }: FrameProps): JSX.Element =>
	layout === "horizontal" ? (
		<LegacyFormRow label={label} htmlFor={htmlFor} hint={info} labelCols={4} fieldCols={fieldCols}>
			{children}
		</LegacyFormRow>
	) : (
		<div className={cn("mb-[16px]", stackedClassName)}>
			<StackedLabel htmlFor={htmlFor} label={label} info={info} />
			{children}
		</div>
	)

/** `label.control-label.text-lg-right.d-flex.m-0` (form.css 6-19: Montserrat Medium, help-block 11px grey .8) */
export const StackedLabel = ({ htmlFor, label, info, className }: { htmlFor: string; label: string; info: string; className?: string }): JSX.Element => (
	<label htmlFor={htmlFor} className={cn("m-0 flex leading-[20px] font-medium", className)}>
		{label}
		<span className="m-0 mb-[4px] ml-[8px] p-0 text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">{info}</span>
	</label>
)

/** `input-number-strict.js` `isNumberKey` — the wizard's `onkeypress` on phones, "Anak ke" and "Kode POS". */
export const digitsOnly = (event: KeyboardEvent<HTMLInputElement>): void => {
	if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return
	if (event.key < "0" || event.key > "9") event.preventDefault()
}

type TextProps = {
	name: string
	id?: string
	type?: "text" | "number"
	value: string
	onChange: (value: string) => void
	placeholder?: string
	disabled?: boolean
	invalid?: boolean
	numeric?: boolean
	className?: string
}

/** `input.form-control` with `spellcheck="false"`, `min="1"` on the number inputs. */
export const SocietyText = ({ name, id, type = "text", value, onChange, placeholder, disabled, invalid, numeric, className }: TextProps): JSX.Element => (
	<LegacyInput
		type={type}
		name={name}
		id={id ?? name}
		{...(type === "number" ? { min: 1 } : {})}
		{...(placeholder === undefined ? {} : { placeholder })}
		{...(numeric === true ? { onKeyDown: digitsOnly } : {})}
		spellCheck={false}
		autoComplete="off"
		value={value}
		disabled={disabled === true}
		onChange={(event) => onChange(event.target.value)}
		className={cn(invalid === true && INVALID_CLASS, className)}
	/>
)

/** `div.input-group.tbr_fix_ig > div.input-group-prepend.tbr_text-grey "62" + input[type=number][min=1]` */
export const PhoneInput = ({ name, value, onChange, disabled, invalid, numeric }: Omit<TextProps, "type" | "placeholder">): JSX.Element => (
	<div className="relative flex w-full flex-wrap items-stretch">
		<div className="mr-[-2px] flex w-[42px] shrink-0 items-center justify-center rounded-l-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[12px] py-[4px] text-[var(--grey)]">
			62
		</div>
		<input
			type="number"
			min={1}
			name={name}
			id={name}
			spellCheck={false}
			value={value}
			disabled={disabled === true}
			{...(numeric === true ? { onKeyDown: digitsOnly } : {})}
			onChange={(event) => onChange(event.target.value)}
			className={cn(
				legacyControlClass,
				"relative w-[1%] min-w-0 flex-auto rounded-l-none focus:z-[3]",
				disabled === true && legacyControlLockedClass,
				invalid === true && INVALID_CLASS,
			)}
		/>
	</div>
)

type SelectProps = {
	id: string
	value: string
	options: readonly { value: string; label: string }[]
	/** Text of the `value=""` option ("Select", "Provinsi", …). */
	placeholder: string
	/** The placeholder option carries `title="Select"`, which select2.css paints grey. */
	mutedPlaceholder?: boolean
	onChange: (value: string) => void
	disabled?: boolean
	invalid?: boolean
}

/** `select.form-control[data-plugin-selectTwo]` — `select.is-invalid + .select2` gets the danger border (select2.css 172). */
export const SocietySelect = ({ id, value, options, placeholder, mutedPlaceholder = true, onChange, disabled, invalid }: SelectProps): JSX.Element => {
	const all = [{ value: "", label: placeholder }, ...options]
	const shown = all.find((option) => option.value === value) ?? all[0]
	return (
		<div id={id}>
			<LegacySelect
				value={value}
				options={all}
				onChange={onChange}
				mutedText={mutedPlaceholder && shown?.value === ""}
				disabled={disabled === true}
				{...(invalid === true ? { className: "border-[var(--danger)]!" } : {})}
			/>
		</div>
	)
}

type RadiosProps = {
	name: string
	value: string
	options: readonly { value: string; label: string; id: string }[]
	onChange: (value: string) => void
	disabled?: boolean
	className?: string
}

// `.custom-control-input:disabled ~ .custom-control-label`: #eeeeee disc, the checked one at .5 (form.css 283-299)
const RADIO_DISABLED =
	"[&_label]:cursor-default [&_label]:text-[#6c757d] [&:has(input:checked)_label>span:first-child]:opacity-50 [&:not(:has(input:checked))_label>span:first-child]:bg-[var(--bg-form-radio-disabled,#eeeeee)]"

/** `div.mt-2 > div.custom-control.custom-radio.custom-control-inline.mr-4 + div.custom-control…inline` */
export const SocietyRadios = ({ name, value, options, onChange, disabled, className }: RadiosProps): JSX.Element => (
	<div inert={disabled === true}>
		<LegacyRadioGroup
			inline
			name={name}
			value={value}
			options={options.map((option) => ({ value: option.value, label: option.label, id: option.id }))}
			onChange={onChange}
			className={cn("mt-[8px] block", className)}
			itemClassName={cn("mt-0 mr-[24px] last:mr-[16px]", disabled === true && RADIO_DISABLED)}
		/>
	</div>
)
