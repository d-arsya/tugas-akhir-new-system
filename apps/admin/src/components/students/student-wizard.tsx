import type { JSX } from "react"

import type { SocietyDraft, SocietyDraftStepKey, SocietyStepKey, SocietyValues } from "@roja/types"

import SocietyWizard from "@/components/society/wizard/society-wizard"
import { toSocietyFormData } from "@/components/society/wizard/society-multipart"
import { useStudentCreate, useStudentOptions } from "@/hooks/use-students"
import { adminApi } from "@/lib/api"

import { setCreatedFlash } from "./student-flash"
import { StudentStepOneHeader } from "./student-step-one"

// The Santri create wizard — `student/create/data/*.blade.php` over `Student\{Personal,Identity,Family,
// Guardian,Attachment}Controller`, on the shared `SocietyWizard` shell.

const STEP_PATH: Record<SocietyStepKey, string> = {
	personal: "/students/create",
	identity: "/students/create/identity",
	family: "/students/create/family",
	guardian: "/students/create/guardian",
	attachment: "/students/create/attachment",
}

// The Subkelas select starts on its first option, "Undefined" (`value="undefined" selected`)
const STEP_DEFAULTS: Partial<Record<SocietyDraftStepKey, SocietyValues>> = { personal: { sub_grade: "undefined" } }

const StudentWizard = ({ step, lockedValues }: { step: SocietyStepKey; lockedValues?: SocietyValues }): JSX.Element => {
	const { data: options } = useStudentOptions()
	const create = useStudentCreate()

	const submit = async (draft: SocietyDraft, files: Partial<Record<string, File>>): Promise<string> => {
		const result = await create.mutateAsync(toSocietyFormData(draft.values, draft.diseases, files))
		// `session()->flash('success', true)` — the edit page greets the new santri once
		setCreatedFlash(result.studentGradeId)
		return `/students/${result.studentGradeId}`
	}

	const validateStep = async (key: SocietyDraftStepKey, draft: SocietyDraft): Promise<void> => {
		await adminApi.validateStudentStep(key, draft)
	}

	return (
		<SocietyWizard
			society="student"
			step={step}
			title="Tambah Santri"
			stepPath={(key) => STEP_PATH[key]}
			renderStepOneHeader={(context) => <StudentStepOneHeader context={context} options={options} />}
			validateStep={validateStep}
			submit={submit}
			stepDefaults={STEP_DEFAULTS}
			{...(lockedValues ? { lockedValues } : {})}
		/>
	)
}

export default StudentWizard
