import { useEffect, type JSX } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import {
	CapabilityCard,
	CARD_BACK_CLASS,
	Kembali,
	YearCrumb,
} from "@/components/student-capabilities/capability-chrome"
import CapabilityStudentTable from "@/components/student-capabilities/capability-student-table"
import {
	useCapabilityAcademicYears,
	useCapabilityGrades,
	useCapabilityStudents,
} from "@/hooks/use-student-capabilities"

// Legacy student-capability/capability.blade.php (@capability + @capabilityList) — level 3, the
// santri of one grade, with `partials/capability-page-header` and `partials/card-header`.
export const Route = createFileRoute("/_auth/student-capabilities/academic-years/$academicYearId/grades/$gradeId/")({
	component: StudentCapabilityStudentsPage,
})

const statusOf = (error: unknown): number | undefined => (error as { response?: { status?: number } })?.response?.status

function StudentCapabilityStudentsPage(): JSX.Element {
	const { academicYearId: yearParam, gradeId: gradeParam } = Route.useParams()
	const academicYearId = Number(yearParam)
	const gradeId = Number(gradeParam)
	const navigate = useNavigate()

	const { data: years } = useCapabilityAcademicYears()
	const { data: grades } = useCapabilityGrades(academicYearId)
	const students = useCapabilityStudents(academicYearId, gradeId)

	const year = years?.find((row) => row.id === academicYearId)?.year ?? null
	const label = grades?.find((row) => row.id === gradeId)?.label ?? null

	// `@capability:98-100` — no applied cost term for this grade and year, back to level 2
	useEffect(() => {
		if (statusOf(students.error) !== 422) return
		void navigate({
			to: "/student-capabilities/academic-years/$academicYearId",
			params: { academicYearId: yearParam },
			replace: true,
		})
	}, [students.error, navigate, yearParam])

	return (
		<>
			<AdminPageTitle
				title="Kesanggupan"
				breadcrumbs={[
					{ label: "…", dropdown: [{ label: "Pembayaran Santri", to: "/student-capabilities" }] },
					{ label: "Kesanggupan", to: "/student-capabilities" },
					{ label: year ?? "", node: <YearCrumb academicYearId={academicYearId} year={year} /> },
					{ label: `Kelas ${label ?? ""}` },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<CapabilityCard
						title="Kelas"
						highlight={label}
						subtitle={<p className="m-0! leading-[24px] text-[var(--grey)]">Semua santri untuk tahun ajaran masuk {year}</p>}
						back={
							<Kembali>
								<Link
									to="/student-capabilities/academic-years/$academicYearId"
									params={{ academicYearId: yearParam }}
									className={CARD_BACK_CLASS}
								>
									<BackArrowIcon />
								</Link>
							</Kembali>
						}
					>
						<CapabilityStudentTable
							academicYearId={academicYearId}
							gradeId={gradeId}
							rows={students.data}
							loaded={students.isSuccess || students.isError}
							processing={students.isFetching}
						/>
					</CapabilityCard>
				</div>
			</div>
		</>
	)
}

export default StudentCapabilityStudentsPage
