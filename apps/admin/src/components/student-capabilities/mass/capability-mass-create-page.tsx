import type { JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import {
	useCapabilityMassCreateAccounts,
	useCapabilityMassCreatePage,
	useCapabilityMassSubmit,
} from "@/hooks/use-capability-mass"

import CapabilityMassForm from "./capability-mass-form"
import { useMassDraft } from "./use-mass-draft"
import { useRejectedSelection, useStudentGradeIds } from "./use-mass-selection"

type CapabilityMassCreatePageProps = { academicYearId: string; gradeId: string; students: string | undefined }

const CapabilityMassCreatePage = ({ academicYearId, gradeId, students }: CapabilityMassCreatePageProps): JSX.Element => {
	const navigate = useNavigate()
	const academicYear = Number(academicYearId)
	const grade = Number(gradeId)
	const studentGradeIds = useStudentGradeIds(students)

	const pageQuery = useCapabilityMassCreatePage(academicYear, grade, studentGradeIds)
	const accountsQuery = useCapabilityMassCreateAccounts(academicYear, grade, studentGradeIds.length > 0)
	const accounts = accountsQuery.data
	const hasOptionTerm = (accounts ?? []).some((row) => row.type === "option")
	const draft = useMassDraft(accounts, hasOptionTerm)

	const backTo = `/student-capabilities/academic-years/${academicYear}/grades/${grade}`
	useRejectedSelection(pageQuery.error ?? accountsQuery.error, backTo)

	const submit = useCapabilityMassSubmit("create", academicYear, grade, backTo, (result) => void navigate({ to: result.redirect }))

	return (
		<CapabilityMassForm
			academicYearId={academicYearId}
			gradeId={gradeId}
			page={pageQuery.data}
			draft={draft}
			submitting={submit.submitting}
			onSubmit={(note) => submit.submit({ studentGradeIds, ...(note ? { note } : {}), items: draft.payload })}
		/>
	)
}

export default CapabilityMassCreatePage
