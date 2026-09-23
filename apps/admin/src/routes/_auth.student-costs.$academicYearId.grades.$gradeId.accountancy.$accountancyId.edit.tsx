import { useEffect, type JSX } from "react"
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router"

import type { StudentCostTermPayload } from "@roja/types"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import StudentCostTermForm from "@/components/student-cost-term/student-cost-term-form"
import { useStudentCostTerm, useUpdateStudentCostTerm } from "@/hooks/use-student-cost-term"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

// Legacy student-cost-term/edit.blade.php — level 4
export const Route = createFileRoute("/_auth/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/edit")({
	component: StudentCostTermEditPage,
})

function StudentCostTermEditPage(): JSX.Element {
	const params = useParams({
		from: "/_auth/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/edit",
	})
	const navigate = useNavigate()
	const ref = {
		academicYearId: Number(params.academicYearId),
		gradeId: Number(params.gradeId),
		accountancyId: Number(params.accountancyId),
	}
	const term = useStudentCostTerm(ref)
	const updateTerm = useUpdateStudentCostTerm(ref)

	// `data-redirect=""` — an empty string is neither undefined nor false, so `default-ajax.js`
	// runs `window.location = ""`, which reloads the current URL. Refetching is the same thing.
	const save = useLegacySubmit({
		mutationFn: (payload: StudentCostTermPayload) => updateTerm.mutateAsync(payload),
		onDone: () => void term.refetch(),
	})

	// Nothing saved yet: legacy would dereference a null term and 500. Send the user to create.
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

			{detail?.term ? (
				<StudentCostTermForm
					// Remount on the post-save refetch so the inputs pick the stored values back up
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
