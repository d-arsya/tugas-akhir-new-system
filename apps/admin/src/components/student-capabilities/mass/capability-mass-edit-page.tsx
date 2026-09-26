import type { JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import {
	useCapabilityMassEditAccounts,
	useCapabilityMassEditPage,
	useCapabilityMassSubmit,
} from "@/hooks/use-capability-mass"

import CapabilityMassForm from "./capability-mass-form"
import { useMassDraft } from "./use-mass-draft"
import { useRejectedSelection, useStudentGradeIds } from "./use-mass-selection"

type CapabilityMassEditPageProps = { academicYearId: string; gradeId: string; students: string | undefined }

const CapabilityMassEditPage = ({ academicYearId, gradeId, students }: CapabilityMassEditPageProps): JSX.Element => {
	const navigate = useNavigate()
	const academicYear = Number(academicYearId)
	const grade = Number(gradeId)
	const studentGradeIds = useStudentGradeIds(students)

	const pageQuery = useCapabilityMassEditPage(academicYear, grade, studentGradeIds)
	const accountsQuery = useCapabilityMassEditAccounts(academicYear, grade, studentGradeIds, studentGradeIds.length > 0)
	const draft = useMassDraft(accountsQuery.data)

	const backTo = `/student-capabilities/academic-years/${academicYear}/grades/${grade}`
	useRejectedSelection(pageQuery.error ?? accountsQuery.error, backTo)

	const submit = useCapabilityMassSubmit("edit", academicYear, grade, backTo, (result) => void navigate({ to: result.redirect }))

	return (
		<CapabilityMassForm
			academicYearId={academicYearId}
			gradeId={gradeId}
			page={pageQuery.data}
			specialCondition={pageQuery.data?.specialCondition === true}
			draft={draft}
			submitting={submit.submitting}
			onSubmit={(note) =>
				submit.submit({
					studentGradeIds,
					...(note ? { note } : {}),
					items: draft.payload,
					shownAccountancyIds: draft.shownAccountancyIds,
				})
			}
		/>
	)
}

export default CapabilityMassEditPage
