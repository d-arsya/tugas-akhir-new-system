import { Fragment, useEffect, useMemo, type JSX, type ReactNode } from "react"

import type {
	SettingFormItem,
	SocietyDisease,
	SocietyFieldErrors,
	SocietyKind,
	SocietyStepKey,
	SocietyValues,
} from "@roja/types"
import { SOCIETY_ADDRESS_GROUPS, SOCIETY_FIELDS, getSocietyField } from "@roja/utils"

import SocietyAddress from "./society-address"
import SocietyAttachmentInput from "./society-attachment-input"
import SocietyDiseaseRepeater from "./society-disease-repeater"
import SocietyFieldView, { radioShown } from "./society-field"
import type { SocietyFieldContext } from "./society-field-context"
import SocietyReadingField from "./society-reading-field"
import SocietyRichText from "./society-richtext"
import { societySettingLookup, type SocietySettingLookup } from "./society-settings"

// OWNER: AK-P. One step / tab of the legacy society form, driven by the setting forms and
// `SOCIETY_FIELDS`. Sources (admin.pondokroja.com):
//   stacked    = resources/views/registrant/partials/edit/data/{personal,identity,family,guardian,attachment}.blade.php
//   horizontal = resources/views/registrant/create/data/{personal,identity,family,guardian,attachment}.blade.php
// (the student and alumni partials are the same markup over `$student_grade` / `$alumni`).
// The wizard's "Kami belum membutuhkan data…" alert and the step-1 `hr` belong to the wizard shell.

export type SocietyFormSectionProps = {
	society: SocietyKind
	step: SocietyStepKey
	/**
	 * "stacked" = the edit tabs (label above the input, `partials/edit/data/*.blade.php`);
	 * "horizontal" = the create wizard (label col-lg-4 right, input col-lg-6, `create/data/*.blade.php`).
	 */
	layout: "stacked" | "horizontal"
	/** Every `tbr_setting_forms` row, sorted by id (visibility, label, required flag). */
	settings: SettingFormItem[]
	values: SocietyValues
	/**
	 * One call per input change. A province pick calls it three times in a row (the province, then
	 * "" for the regency and the district), so keep the state update functional.
	 */
	onChange: (name: string, value: string) => void
	diseases: SocietyDisease[]
	onDiseasesChange: (next: SocietyDisease[]) => void
	/** Chosen `attach_*` files by column (the attachment step / tab). */
	files: Partial<Record<string, File>>
	onFileChange: (name: string, file: File | null) => void
	/** Current attachment URLs on an edit page. */
	attachmentUrls?: Record<string, string | null>
	errors: SocietyFieldErrors
	/** PSB edit of a portal-registered row (`registered_by_admin = 0`): every input disabled. */
	disabled?: boolean
}

// `hr.tbr_divider_solid` (app.css 486-490) over porto's 22px `hr` margins
const Divider = (): JSX.Element => <hr className="my-[22px] h-[2px] border-0 bg-[var(--bg-primary)]" />

const range = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => from + i)

type Part = number | { divider: (lookup: SocietySettingLookup) => boolean }

// The fields of each step in blade order, with the blades' `lineVisible` dividers between them
const STEP_PARTS: Record<SocietyStepKey, Part[]> = {
	personal: range(1, 21),
	identity: [
		...range(23, 28),
		{ divider: (s) => s.lineVisible(23, 28) && (s.status(30) || s.lineVisible(32, 33) || s.status(35)) },
		30,
		{ divider: (s) => s.status(30) && (s.lineVisible(32, 33) || s.status(35)) },
		32,
		33,
		{ divider: (s) => s.lineVisible(32, 33) && s.status(35) },
		35,
	],
	family: [
		...range(37, 43),
		{ divider: (s) => s.lineVisible(37, 43) && (s.lineVisible(44, 50) || s.status(52)) },
		...range(44, 50),
		{ divider: (s) => s.lineVisible(44, 50) && s.status(52) },
		52,
	],
	// Legacy writes `getInputStatus($setting_forms, 54, 60)`, which only looks at 54
	guardian: [...range(54, 60), { divider: (s) => s.status(54) && s.status(62) }, 62],
	attachment: range(63, 69),
}

/** One step / tab of the legacy society form, driven by the setting forms and `SOCIETY_FIELDS`. */
export default function SocietyFormSection({
	step,
	layout,
	settings,
	values,
	onChange,
	diseases,
	onDiseasesChange,
	files,
	onFileChange,
	attachmentUrls,
	errors,
	disabled = false,
}: SocietyFormSectionProps): JSX.Element {
	const lookup = useMemo(() => societySettingLookup(settings), [settings])
	const ctx: SocietyFieldContext = { layout, lookup, values, set: onChange, errors, disabled }

	// An unset radio still shows its first option checked, and legacy posts that value — hand it up
	useEffect(() => {
		if (disabled || settings.length === 0) return
		for (const field of SOCIETY_FIELDS) {
			if (field.step !== step || field.widget !== "radio" || !lookup.status(field.id)) continue
			const [column] = field.columns
			if (column === undefined) continue
			const current = values[column] ?? ""
			const shown = radioShown(field, current)
			if (current !== shown) onChange(column, shown)
		}
	}, [disabled, settings.length, step, lookup, values, onChange])

	const render = (id: number): ReactNode => {
		const field = getSocietyField(id)
		if (field === undefined || !lookup.status(id)) return null
		if (id === 32) return <SocietyReadingField ctx={ctx} />
		const [column = ""] = field.columns
		switch (field.widget) {
			case "address":
			case "school-address": {
				const group = SOCIETY_ADDRESS_GROUPS.find((entry) => entry.settingId === id)
				return group ? <SocietyAddress ctx={ctx} group={group} lastClassName={id === 13 ? "mb-[16px]" : "mb-0"} /> : null
			}
			case "richtext":
				return (
					<SocietyRichText
						layout={layout}
						name={column}
						label={lookup.label(field.labelId ?? id)}
						value={values[column] ?? ""}
						onChange={(value) => onChange(column, value)}
						error={errors[column]}
						disabled={disabled}
					/>
				)
			case "disease-repeater":
				return (
					<SocietyDiseaseRepeater
						layout={layout}
						label={lookup.label(id)}
						diseases={diseases}
						onChange={onDiseasesChange}
						errors={errors}
						disabled={disabled}
					/>
				)
			case "image":
				return (
					<SocietyAttachmentInput
						layout={layout}
						name={column}
						label={lookup.label(id)}
						info={lookup.info(id)}
						photoHint={id === 64}
						url={attachmentUrls?.[column] ?? null}
						file={files[column]}
						onFileChange={onFileChange}
						error={errors[column]}
						disabled={disabled}
					/>
				)
			default:
				return <SocietyFieldView ctx={ctx} field={field} />
		}
	}

	return (
		<div>
			{STEP_PARTS[step].map((part, index) =>
				typeof part === "number" ? (
					<Fragment key={part}>{render(part)}</Fragment>
				) : part.divider(lookup) ? (
					<Divider key={`hr-${index}`} />
				) : null,
			)}
		</div>
	)
}
