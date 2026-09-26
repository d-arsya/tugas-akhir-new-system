import type { JSX } from "react"

import type { SocietyDraft, SocietyDraftStepKey, SocietyStepKey, SocietyValues } from "@roja/types"

import SocietyWizard from "@/components/society/wizard/society-wizard"
import { toSocietyFormData } from "@/components/society/wizard/society-multipart"
import { useStudentCreate, useStudentOptions, useValidateStudentStep } from "@/hooks/use-students"

import { setCreatedFlash } from "./student-flash"
import { StudentStepOneHeader } from "./student-step-one"

const STEP_PATH: Record<SocietyStepKey, string> = {
	personal: "/students/create",
	identity: "/students/create/identity",
	family: "/students/create/family",
	guardian: "/students/create/guardian",
	attachment: "/students/create/attachment",
}

const STEP_DEFAULTS: Partial<Record<SocietyDraftStepKey, SocietyValues>> = { personal: { sub_grade: "undefined" } }

const StudentWizard = ({ step, lockedValues }: { step: SocietyStepKey; lockedValues?: SocietyValues }): JSX.Element => {
	const { data: options } = useStudentOptions()
	const create = useStudentCreate()
	const validate = useValidateStudentStep()

	const submit = async (draft: SocietyDraft, files: Partial<Record<string, File>>): Promise<string> => {
		const result = await create.mutateAsync(toSocietyFormData(draft.values, draft.diseases, files))
		setCreatedFlash(result.studentGradeId)
		return `/students/${result.studentGradeId}`
	}

	const validateStep = async (key: SocietyDraftStepKey, draft: SocietyDraft): Promise<void> => {
		await validate.mutateAsync({ step: key, draft })
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
