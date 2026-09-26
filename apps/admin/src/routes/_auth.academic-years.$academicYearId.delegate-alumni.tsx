import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AcademicYearDelegatePage from "@/components/academic-years/academic-year-delegate-page"

export const Route = createFileRoute("/_auth/academic-years/$academicYearId/delegate-alumni")({
	component: AcademicYearDelegateAlumniRoute,
})

function AcademicYearDelegateAlumniRoute(): JSX.Element {
	const { academicYearId } = Route.useParams()
	return <AcademicYearDelegatePage academicYearId={Number(academicYearId)} step="delegate-alumni" />
}

export default AcademicYearDelegateAlumniRoute
