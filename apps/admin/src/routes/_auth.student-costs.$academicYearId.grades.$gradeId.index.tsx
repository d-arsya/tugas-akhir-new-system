import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentCostAccountsPage from "@/components/student-costs/student-cost-accounts-page"

export const Route = createFileRoute("/_auth/student-costs/$academicYearId/grades/$gradeId/")({
	component: StudentCostAccountsRoute,
})

function StudentCostAccountsRoute(): JSX.Element {
	const { academicYearId, gradeId } = Route.useParams()
	return <StudentCostAccountsPage academicYearId={Number(academicYearId)} gradeId={Number(gradeId)} />
}

export default StudentCostAccountsRoute
