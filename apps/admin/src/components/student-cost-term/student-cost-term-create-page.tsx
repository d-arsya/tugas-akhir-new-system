import { useEffect, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { StudentCostTermPayload } from "@roja/types"

import {
	useCreateStudentCostTerm,
	useStudentCostTerm,
	type StudentCostTermParams,
} from "@/hooks/use-student-cost-term"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

import StudentCostTermForm from "./student-cost-term-form"
import StudentCostTermTitle from "./student-cost-term-title"

const StudentCostTermCreatePage = ({ params }: { params: StudentCostTermParams }): JSX.Element => {
	const navigate = useNavigate()
	const ref = {
		academicYearId: Number(params.academicYearId),
		gradeId: Number(params.gradeId),
		accountancyId: Number(params.accountancyId),
	}
	const term = useStudentCostTerm(ref)
	const createTerm = useCreateStudentCostTerm(ref)

	const save = useLegacySubmit({
		mutationFn: (payload: StudentCostTermPayload) => createTerm.mutateAsync(payload),
		onDone: () =>
			void navigate({
				to: "/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/edit",
				params,
			}),
	})

	const saved = term.data?.term ?? null
	useEffect(() => {
		if (!saved) return
		void navigate({
			to: "/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/edit",
			params,
			replace: true,
		})
	}, [saved, navigate, params])

	const detail = term.data

	return (
		<>
			<StudentCostTermTitle academicYearId={params.academicYearId} gradeId={params.gradeId} detail={detail} />

			{detail && !saved ? (
				<StudentCostTermForm
					mode="create"
					detail={detail}
					backTo={{ academicYearId: params.academicYearId, gradeId: params.gradeId }}
					onSubmit={save.submit}
					submitting={save.submitting}
				/>
			) : null}
		</>
	)
}

export default StudentCostTermCreatePage
