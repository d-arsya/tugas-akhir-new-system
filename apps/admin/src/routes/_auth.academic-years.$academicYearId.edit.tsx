import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AcademicYearEditPage from "@/components/academic-years/academic-year-edit-page"

export const Route = createFileRoute("/_auth/academic-years/$academicYearId/edit")({
	component: AcademicYearEditRoute,
})

function AcademicYearEditRoute(): JSX.Element {
	const { academicYearId } = Route.useParams()
	return <AcademicYearEditPage academicYearId={Number(academicYearId)} />
}

export default AcademicYearEditRoute
