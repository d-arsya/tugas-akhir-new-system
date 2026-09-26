import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentCostTermEditPage from "@/components/student-cost-term/student-cost-term-edit-page"

export const Route = createFileRoute("/_auth/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/edit")({
	component: StudentCostTermEditRoute,
})

function StudentCostTermEditRoute(): JSX.Element {
	return <StudentCostTermEditPage params={Route.useParams()} />
}

export default StudentCostTermEditRoute
