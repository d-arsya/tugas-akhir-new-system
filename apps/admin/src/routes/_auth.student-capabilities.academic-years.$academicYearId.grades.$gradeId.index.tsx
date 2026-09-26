import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import CapabilityStudentsPage from "@/components/student-capabilities/capability-students-page"

export const Route = createFileRoute("/_auth/student-capabilities/academic-years/$academicYearId/grades/$gradeId/")({
	component: StudentCapabilityStudentsPage,
})

function StudentCapabilityStudentsPage(): JSX.Element {
	const { academicYearId, gradeId } = Route.useParams()
	return <CapabilityStudentsPage academicYearId={academicYearId} gradeId={gradeId} />
}

export default StudentCapabilityStudentsPage
