import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import CapabilityGradesPage from "@/components/student-capabilities/capability-grades-page"

export const Route = createFileRoute("/_auth/student-capabilities/academic-years/$academicYearId/")({
	component: StudentCapabilityGradesPage,
})

function StudentCapabilityGradesPage(): JSX.Element {
	const { academicYearId } = Route.useParams()
	return <CapabilityGradesPage academicYearId={Number(academicYearId)} />
}

export default StudentCapabilityGradesPage
