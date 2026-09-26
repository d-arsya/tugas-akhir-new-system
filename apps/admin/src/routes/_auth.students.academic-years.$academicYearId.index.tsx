import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentGradesPage from "@/components/students/student-grades-page"

export const Route = createFileRoute("/_auth/students/academic-years/$academicYearId/")({
	component: Page,
})

function Page(): JSX.Element {
	const { academicYearId } = Route.useParams()
	return <StudentGradesPage academicYearId={Number(academicYearId)} />
}

export default Page
