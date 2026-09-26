import { useEffect, type JSX } from "react"
import { Link, useNavigate } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import { useStudentRosterPage } from "@/hooks/use-students"

import StudentRoster from "./student-roster"

type StudentRosterPageProps = { academicYearId: string; grade: string; levelId: string }

const StudentRosterPage = ({ academicYearId, grade, levelId }: StudentRosterPageProps): JSX.Element => {
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

export default StudentRosterPage
