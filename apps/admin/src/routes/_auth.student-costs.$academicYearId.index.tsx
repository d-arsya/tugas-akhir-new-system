import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import StudentCostGradeTable from "@/components/student-costs/student-cost-grade-table"
import { useStudentCostYears } from "@/hooks/use-student-costs"

// Legacy student-cost-term/grade.blade.php — level 2, pick a grade
export const Route = createFileRoute("/_auth/student-costs/$academicYearId/")({
	component: StudentCostGradesPage,
})

function StudentCostGradesPage(): JSX.Element {
	const { academicYearId } = Route.useParams()
	const yearId = Number(academicYearId)
	// `account-page-header` ends on `{{ $academic_year->year }}`; the level-1 list already has it,
	// and this page has no other reason to fetch the year
	const { data: years } = useStudentCostYears()
	const year = years?.find((row) => row.id === yearId)?.year ?? ""

	return (
		<>
			<AdminPageTitle title="Biaya Santri" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/student-costs" }] }, { label: "Keuangan", to: "/student-costs" }, { label: "Biaya Santri", to: "/student-costs" }, { label: year }]} />

			{/* `.row > .col > .card.tbr_card > .card-body.p-4` */}
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<LegacyCard>
						<StudentCostGradeTable academicYearId={yearId} />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default StudentCostGradesPage
