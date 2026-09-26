import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import RegistrantYearPage from "@/components/registrants/registrant-year-page"

export const Route = createFileRoute("/_auth/registrants/academic-years/$academicYearId/")({
	component: Page,
})

function Page(): JSX.Element {
	const { academicYearId } = Route.useParams()
	return <RegistrantYearPage academicYearId={Number(academicYearId)} />
}

export default Page
