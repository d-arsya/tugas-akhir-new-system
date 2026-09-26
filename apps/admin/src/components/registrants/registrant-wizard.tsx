import type { JSX } from "react"

import type { SocietyDraft, SocietyDraftStepKey, SocietyStepKey } from "@roja/types"

import LegacyFormRow from "@/components/legacy/legacy-form-row"
import { FieldError, SocietySelect } from "@/components/society/society-controls"
import { societySettingLookup } from "@/components/society/society-settings"
import { toSocietyFormData } from "@/components/society/wizard/society-multipart"
import SocietyWizard, { type SocietyWizardStepOneContext } from "@/components/society/wizard/society-wizard"
import { useInvalidateAkademik, useRegistrantCreateOptions } from "@/hooks/use-registrants"
import { adminApi } from "@/lib/api"

import { flashRegistrantCreated } from "./registrant-flash"

// The PSB create wizard — `registrant/create/data/*.blade.php` on AK-S's `SocietyWizard`. Step 1 starts with
// Tahun Ajaran (every year but Archive, newest first), Jenjang (`status = show`) and Jalur
// (`create/data/personal.blade.php:31-145`), then `hr.tbr_divider_solid` when any field 1–21 is on.

const STEP_PATH: Record<SocietyStepKey, string> = {
	personal: "/registrants/create",
	identity: "/registrants/create/identity",
	family: "/registrants/create/family",
	guardian: "/registrants/create/guardian",
	attachment: "/registrants/create/attachment",
}

const PATH_OPTIONS = [
	{ value: "indent", label: "Indent" },
	{ value: "reguler", label: "Reguler" },
]

const StepOneHeader = ({ values, onChange, errors, settings }: SocietyWizardStepOneContext): JSX.Element => {
	const { data } = useRegistrantCreateOptions()
	const row = (id: string, name: string, label: string, options: { value: string; label: string }[]): JSX.Element => (
		// `div.form-group.row > label.col-lg-4.control-label.text-lg-right.m-0 {label}<span.help-block>required` + `div.col-lg-6`
		<LegacyFormRow label={label} htmlFor={id} hint="required" labelCols={4} fieldCols={6}>
			<SocietySelect
				id={name}
				value={values[name] ?? ""}
				options={options}
				placeholder="Select"
				onChange={(value) => onChange(name, value)}
				invalid={errors[name] !== undefined}
			/>
			<FieldError message={errors[name]} />
		</LegacyFormRow>
	)

	return (
		<>
			{row(
				"academic_year",
				"academic_year_id",
				"Tahun Ajaran yang Dipilih",
				(data?.academicYears ?? []).map((year) => ({ value: String(year.id), label: year.year ?? "" })),
			)}
			{row(
				"level_id",
				"level_id",
				"Pilih Jenjang",
				(data?.levels ?? []).map((level) => ({ value: String(level.id), label: level.name })),
			)}
			{row("register_type", "registration_path", "Jalur Pendaftaran", PATH_OPTIONS)}
			{societySettingLookup(settings).lineVisible(1, 21) ? <hr className="my-[22px] h-[2px] border-0 bg-[var(--bg-primary)]" /> : null}
		</>
	)
}

const RegistrantWizard = ({ step }: { step: SocietyStepKey }): JSX.Element => {
	const invalidate = useInvalidateAkademik()

	const validateStep = async (key: SocietyDraftStepKey, draft: SocietyDraft): Promise<void> => {
		await adminApi.validateRegistrantStep(key, draft)
	}

	// `AttachmentController::validateAttachmentData` → `redirect: route('registrant.edit')` + `session()->flash('success')`
	const submit = async (draft: SocietyDraft, files: Partial<Record<string, File>>): Promise<string> => {
		const result = await adminApi.createRegistrant(toSocietyFormData(draft.values, draft.diseases, files))
		flashRegistrantCreated(result.id)
		void invalidate()
		return result.redirect
	}

	return (
		<SocietyWizard
			society="registrant"
			step={step}
			title="Tambah PSB"
			stepPath={(key) => STEP_PATH[key]}
			renderStepOneHeader={(context) => <StepOneHeader {...context} />}
			validateStep={validateStep}
			submit={submit}
		/>
	)
}

export default RegistrantWizard
