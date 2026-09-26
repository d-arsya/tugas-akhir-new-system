import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentRosterPage from "@/components/students/student-roster-page"

export const Route = createFileRoute("/_auth/students/academic-years/$academicYearId/grades/$grade/levels/$levelId")({
	component: Page,
})

function Page(): JSX.Element {
	const { academicYearId, grade, levelId } = Route.useParams()
	return <StudentRosterPage academicYearId={academicYearId} grade={grade} levelId={levelId} />
}

export default Page
