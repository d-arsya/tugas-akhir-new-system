import { useEffect, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { StudentCostTermPayload } from "@roja/types"

import {
	useStudentCostTerm,
	useUpdateStudentCostTerm,
	type StudentCostTermParams,
} from "@/hooks/use-student-cost-term"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

import StudentCostTermForm from "./student-cost-term-form"
import StudentCostTermTitle from "./student-cost-term-title"

const StudentCostTermEditPage = ({ params }: { params: StudentCostTermParams }): JSX.Element => {
	const navigate = useNavigate()
	const ref = {
		academicYearId: Number(params.academicYearId),
		gradeId: Number(params.gradeId),
		accountancyId: Number(params.accountancyId),
	}
	const term = useStudentCostTerm(ref)
	const updateTerm = useUpdateStudentCostTerm(ref)

	const save = useLegacySubmit({
		mutationFn: (payload: StudentCostTermPayload) => updateTerm.mutateAsync(payload),
		onDone: () => void term.refetch(),
	})

	const detail = term.data
	const missing = term.isSuccess && detail?.term === null
	useEffect(() => {
		if (!missing) return
		void navigate({
			to: "/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/create",
			params,
			replace: true,
		})
	}, [missing, navigate, params])

	return (
		<>
			<StudentCostTermTitle academicYearId={params.academicYearId} gradeId={params.gradeId} detail={detail} />

			{detail?.term ? (
				<StudentCostTermForm
					key={`${detail.term.id}-${detail.term.type}-${detail.term.period}-${detail.term.amounts.join(",")}`}
					mode="edit"
					detail={detail}
					backTo={{ academicYearId: params.academicYearId, gradeId: params.gradeId }}
					onSubmit={save.submit}
					submitting={save.submitting}
				/>
			) : null}
		</>
	)
}

export default StudentCostTermEditPage
