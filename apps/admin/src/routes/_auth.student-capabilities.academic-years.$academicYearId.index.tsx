import type { JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import { CapabilityCard, CARD_BACK_CLASS, Kembali } from "@/components/student-capabilities/capability-chrome"
import CapabilityGradeTable from "@/components/student-capabilities/capability-grade-table"
import { useCapabilityAcademicYears } from "@/hooks/use-student-capabilities"

// Legacy student-capability/grade.blade.php (@grade + @gradeList) — level 2, the grades of one
// academic year, with `partials/grade-page-header` and `partials/grade-card-header`.
export const Route = createFileRoute("/_auth/student-capabilities/academic-years/$academicYearId/")({
	component: StudentCapabilityGradesPage,
})

function StudentCapabilityGradesPage(): JSX.Element {
	const { academicYearId } = Route.useParams()
	const yearId = Number(academicYearId)
	// The header ends on `{{ $academic_year->year }}`; the level-1 list already carries it
	const { data: years } = useCapabilityAcademicYears()
	const year = years?.find((row) => row.id === yearId)?.year ?? null

	return (
		<>
			<AdminPageTitle
				title="Kesanggupan"
				breadcrumbs={[
					{ label: "Pembayaran Santri", to: "/student-capabilities" },
					{ label: "Kesanggupan", to: "/student-capabilities" },
					{ label: year ?? "" },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<CapabilityCard
						title="Tahun ajaran"
						highlight={year}
						subtitle={<div>Atur kesanggupan untuk semua santri pada setiap kelasnya.</div>}
						back={
							<Kembali>
								<Link to="/student-capabilities" className={CARD_BACK_CLASS}>
									<BackArrowIcon />
								</Link>
							</Kembali>
						}
					>
						<CapabilityGradeTable academicYearId={yearId} year={year} />
					</CapabilityCard>
				</div>
			</div>
		</>
	)
}

export default StudentCapabilityGradesPage
