import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AcademicYearDelegatePage from "@/components/academic-years/academic-year-delegate-page"

export const Route = createFileRoute("/_auth/academic-years/$academicYearId/delegate-student")({
	component: AcademicYearDelegateStudentRoute,
})

function AcademicYearDelegateStudentRoute(): JSX.Element {
	const { academicYearId } = Route.useParams()
	return <AcademicYearDelegatePage academicYearId={Number(academicYearId)} step="delegate-student" />
}

export default AcademicYearDelegateStudentRoute
