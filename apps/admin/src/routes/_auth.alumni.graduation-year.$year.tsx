import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AlumniYearPage from "@/components/alumni/alumni-year-page"

// Legacy alumni/alumni.blade.php — the alumni of one graduation year
export const Route = createFileRoute("/_auth/alumni/graduation-year/$year")({
	component: Page,
})

function Page(): JSX.Element {
	const { year } = Route.useParams()
	// Remount per year so the filters and paging start fresh, as a new page load does
	return <AlumniYearPage key={year} year={Number(year)} />
}

export default Page
