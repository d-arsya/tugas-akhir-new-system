import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AcademicYearCreatePage from "@/components/academic-years/academic-year-create-page"

export const Route = createFileRoute("/_auth/academic-years/create")({
	component: AcademicYearCreateRoute,
})

function AcademicYearCreateRoute(): JSX.Element {
	return <AcademicYearCreatePage />
}

export default AcademicYearCreateRoute
