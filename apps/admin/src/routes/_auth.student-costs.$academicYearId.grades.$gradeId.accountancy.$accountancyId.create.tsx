import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentCostTermCreatePage from "@/components/student-cost-term/student-cost-term-create-page"

export const Route = createFileRoute("/_auth/student-costs/$academicYearId/grades/$gradeId/accountancy/$accountancyId/create")({
	component: StudentCostTermCreateRoute,
})

function StudentCostTermCreateRoute(): JSX.Element {
	return <StudentCostTermCreatePage params={Route.useParams()} />
}

export default StudentCostTermCreateRoute
