import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentCostGradesPage from "@/components/student-costs/student-cost-grades-page"

export const Route = createFileRoute("/_auth/student-costs/$academicYearId/")({
	component: StudentCostGradesRoute,
})

function StudentCostGradesRoute(): JSX.Element {
	const { academicYearId } = Route.useParams()
	return <StudentCostGradesPage academicYearId={Number(academicYearId)} />
}

export default StudentCostGradesRoute
