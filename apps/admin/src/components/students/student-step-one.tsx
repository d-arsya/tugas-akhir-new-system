import type { JSX, ReactNode } from "react"

import type { AdminStudentOptions } from "@roja/types"

import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import type { SocietyWizardStepOneContext } from "@/components/society/wizard/society-wizard"
import { WizardFieldError } from "@/components/society/wizard/wizard-errors"
import { lineVisible } from "@/components/society/wizard/wizard-settings"

// The Santri-only rows at the top of step 1 — `student/create/data/personal.blade.php:31-274`: Tahun
// Ajaran, Kelas, Subkelas, Jenjang (always disabled, filled from the Kelas by `autofill-level.js`), Sumber,
// the divider (`lineVisible($setting_forms, 1, 21)`) and the optional NISP.

type Option = { value: string; label: string }

// `.help-block` under the label (form.css 1-29), as `LegacyFormRow` renders it
const HelpBlock = ({ children }: { children: ReactNode }): JSX.Element => (
	<span className="m-0 mb-[4px] block p-0 text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">{children}</span>
)

type SelectRowProps = {
	label: string
	name: string
	value: string
	options: Option[]
	/** The first option's text; "Select" options carry `title="Select"`, which select2.css paints grey */
	placeholder: Option
	onChange: (value: string) => void
	disabled: boolean
	error: string | undefined
	hint: "required" | "optional"
}

const SelectRow = ({ label, name, value, options, placeholder, onChange, disabled, error, hint }: SelectRowProps): JSX.Element => {
	const all = [placeholder, ...options]
	const shown = all.find((option) => option.value === value) ?? placeholder
	return (
		<LegacyFormRow label={label} htmlFor={name} hint={hint} fieldCols={6}>
			<div id={name}>
				<LegacySelect
					value={shown.value}
					options={all}
					onChange={onChange}
					mutedText={shown.value === placeholder.value}
					disabled={disabled}
					{...(error ? { className: "border-[var(--danger)]!" } : {})}
				/>
			</div>
			<WizardFieldError message={error} />
		</LegacyFormRow>
	)
}

const SELECT: Option = { value: "", label: "Select" }

export const StudentStepOneHeader = ({
	context,
	options,
}: {
	context: SocietyWizardStepOneContext
	options: AdminStudentOptions | undefined
}): JSX.Element => {
	const { values, onChange, errors, settings, locked } = context
	const years = (options?.academicYears ?? [])
		.filter((year) => year.id !== 1)
		.sort((a, b) => (b.year ?? "").localeCompare(a.year ?? ""))
		.map((year) => ({ value: String(year.id), label: year.year ?? "" }))
	const grades = (options?.grades ?? []).map((grade) => ({ value: String(grade.label ?? ""), label: String(grade.label ?? "") }))
	const levels = (options?.levels ?? []).map((level) => ({ value: String(level.id), label: level.name ?? "" }))
	const subGrades = (options?.subGrades ?? []).map((label) => ({ value: label, label }))

	// `autofill-level.js`: POST /get-level-by-grade/{label} binds `Grade` by id — the ids equal the labels
	const pickGrade = (value: string): void => {
		onChange("grade", value)
		const level = options?.grades.find((grade) => grade.id === Number(value))?.levelId
		if (level !== undefined && level !== null) onChange("level_id", String(level))
	}

	return (
		<>
			<SelectRow
				label="Tahun Ajaran yang Dipilih"
				name="academic_year_id"
				value={values["academic_year_id"] ?? ""}
				options={years}
				placeholder={SELECT}
				onChange={(value) => onChange("academic_year_id", value)}
				disabled={locked.has("academic_year_id")}
				error={errors["academic_year_id"]}
				hint="required"
			/>
			<SelectRow
				label="Kelas"
				name="grade"
				value={values["grade"] ?? ""}
				options={grades}
				placeholder={SELECT}
				onChange={pickGrade}
				disabled={locked.has("grade")}
				error={errors["grade"]}
				hint="required"
			/>
			<SelectRow
				label="Subkelas"
				name="sub_grade"
				value={values["sub_grade"] ?? "undefined"}
				options={subGrades}
				placeholder={{ value: "undefined", label: "Undefined" }}
				onChange={(value) => onChange("sub_grade", value)}
				disabled={false}
				error={errors["sub_grade"]}
				hint="optional"
			/>
			<SelectRow
				label="Pilih Jenjang"
				name="level_id"
				value={values["level_id"] ?? ""}
				options={levels}
				placeholder={SELECT}
				onChange={() => undefined}
				disabled
				error={errors["level_id"]}
				hint="required"
			/>
			<SelectRow
				label="Sumber"
				name="source"
				value={values["source"] ?? ""}
				options={[
					{ value: "pendaftaran", label: "Pendaftaran" },
					{ value: "santri lama", label: "Santri Lama" },
					{ value: "mutasi", label: "Mutasi" },
				]}
				placeholder={SELECT}
				onChange={(value) => onChange("source", value)}
				disabled={false}
				error={errors["source"]}
				hint="required"
			/>

			{/* `hr.tbr_divider_solid` (app.css 486-490) over porto's 22px `hr` margins */}
			{lineVisible(settings, 1, 21) ? <hr className="my-[22px] h-[2px] border-0 bg-[var(--bg-primary)]" /> : null}

			<LegacyFormRow
				label={
					<>
						NISP
						<HelpBlock>Optional</HelpBlock>
					</>
				}
				htmlFor="nis"
				fieldCols={6}
			>
				<LegacyInput
					type="number"
					name="nis"
					id="nis"
					autoComplete="off"
					spellCheck={false}
					value={values["nis"] ?? ""}
					onChange={(event) => onChange("nis", event.target.value)}
					className={errors["nis"] ? "border-[var(--danger)]!" : undefined}
				/>
				<span className="text-[var(--grey)]">Nomor induk harus berupa angka dan bersifat unik.</span>
				<WizardFieldError message={errors["nis"]} />
			</LegacyFormRow>
		</>
	)
}
