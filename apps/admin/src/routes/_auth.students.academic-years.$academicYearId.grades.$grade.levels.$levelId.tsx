import { useEffect, type JSX } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import StudentRoster from "@/components/students/student-roster"
import { useStudentRosterPage } from "@/hooks/use-students"

// Legacy student/student.blade.php (+ partials/listing-student/*) — `StudentController::students:288`: the
// santri of one class (year × Kelas × Jenjang). A class without a live row sends the admin back to the
// grades page (legacy `redirect()->route('student.grades')`).
export const Route = createFileRoute("/_auth/students/academic-years/$academicYearId/grades/$grade/levels/$levelId")({
	component: Page,
})

function Page(): JSX.Element {
	const { academicYearId, grade, levelId } = Route.useParams()
	const navigate = useNavigate()
	const { data: page, isError } = useStudentRosterPage(Number(academicYearId), Number(grade), Number(levelId))

	useEffect(() => {
		if (isError || page?.exists === false) {
			void navigate({ to: "/students/academic-years/$academicYearId", params: { academicYearId }, replace: true })
		}
	}, [isError, page?.exists, navigate, academicYearId])

	return (
		<>
			<AdminPageTitle
				title="Data Santri"
				breadcrumbs={[
					{ label: "Santri", dropdown: [{ label: "Santri", to: "/students" }, { label: "Akademik", to: "/students" }] },
					{ label: "Data Santri", to: "/students" },
					{
						label: page?.academicYear.year ?? "",
						// `<a href="">` — the year links back to this very page
						node: (
							<Link
								to="/students/academic-years/$academicYearId/grades/$grade/levels/$levelId"
								params={{ academicYearId, grade, levelId }}
								className={CRUMB_LINK_CLASS}
							>
								{page?.academicYear.year ?? ""}
							</Link>
						),
					},
					{ label: `Kelas ${grade}` },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">{page?.exists ? <StudentRoster page={page} /> : null}</div>
			</div>
		</>
	)
}

export default Page
