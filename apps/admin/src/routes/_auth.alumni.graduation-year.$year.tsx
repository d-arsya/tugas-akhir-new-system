import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AlumniYearPage from "@/components/alumni/alumni-year-page"

export const Route = createFileRoute("/_auth/alumni/graduation-year/$year")({
	component: Page,
})

function Page(): JSX.Element {
	const { year } = Route.useParams()
	return <AlumniYearPage key={year} year={Number(year)} />
}

export default Page
