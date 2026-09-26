import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AcademicYearDeletePage from "@/components/academic-years/academic-year-delete-page"

export const Route = createFileRoute("/_auth/academic-years/$academicYearId/delete")({
	component: AcademicYearDeleteRoute,
})

function AcademicYearDeleteRoute(): JSX.Element {
	const { academicYearId } = Route.useParams()
	return <AcademicYearDeletePage academicYearId={Number(academicYearId)} />
}

export default AcademicYearDeleteRoute
