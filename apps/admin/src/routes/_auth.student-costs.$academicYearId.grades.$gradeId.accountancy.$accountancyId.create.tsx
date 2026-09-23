import { useEffect, type JSX } from "react"
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router"

import type { StudentCostTermPayload } from "@roja/types"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import StudentCostTermForm from "@/components/student-cost-term/student-cost-term-form"
import { useCreateStudentCostTerm, useStudentCostTerm } from "@/hooks/use-student-cost-term"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

// Legacy student-cost-term/create.blade.php — level 4
export const Route = createFileRoute("/_auth/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/create")({
	component: StudentCostTermCreatePage,
})

function StudentCostTermCreatePage(): JSX.Element {
	const params = useParams({
		from: "/_auth/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/create",
	})
	const navigate = useNavigate()
	const ref = {
		academicYearId: Number(params.academicYearId),
		gradeId: Number(params.gradeId),
		accountancyId: Number(params.accountancyId),
	}
	const term = useStudentCostTerm(ref)
	const createTerm = useCreateStudentCostTerm(ref)

	// `data-redirect="{{ route('studentCost.edit', …) }}"` — the create form lands on the edit page
	const save = useLegacySubmit({
		mutationFn: (payload: StudentCostTermPayload) => createTerm.mutateAsync(payload),
		onDone: () =>
			void navigate({
				to: "/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/edit",
				params,
			}),
	})

	/**
	 * `create()` aborts **404** when a term already exists for this year, grade and accountancy.
	 * The only way to reach that state is a hand-typed URL or a row saved from another tab, so
	 * the port sends you to the page you were after instead — the same handling `findStep` gives
	 * an out-of-date Jenjang destroy icon.
	 */
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

	const yearLabel = detail?.academicYear.year ?? "Tahun Ajaran"
	const gradeLabel = detail ? `Kelas ${detail.grade.label ?? ""}`.trim() : "Kelas"

	return (
		<>
			<AdminPageTitle
				title="Detail Biaya Santri"
				breadcrumbs={[
					// `li.tbr_breadcrumbs_parent` — on level 4 the dots crumb holds all three parents,
					// where level 3 keeps only "Data Master" in it. Both link to `studentCost.index`.
					{
						label: "…",
						dropdown: [
							{ label: "Data Master", to: "/student-costs" },
							{ label: "Keuangan", to: "/student-costs" },
							{ label: "Biaya Santri", to: "/student-costs" },
						],
					},
					// `studentCost.grade` and `studentCost.accounts` take route params, so the links are
					// composed here rather than through `to` (TanStack types `params` per route).
					{
						label: yearLabel,
						node: (
							<Link to="/student-costs/$academicYearId" params={{ academicYearId: params.academicYearId }} className={CRUMB_LINK_CLASS}>
								{yearLabel}
							</Link>
						),
					},
					{
						label: gradeLabel,
						node: (
							<Link
								to="/student-costs/$academicYearId/grades/$gradeId"
								params={{ academicYearId: params.academicYearId, gradeId: params.gradeId }}
								className={CRUMB_LINK_CLASS}
							>
								{gradeLabel}
							</Link>
						),
					},
					{ label: "Detail" },
				]}
			/>

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
