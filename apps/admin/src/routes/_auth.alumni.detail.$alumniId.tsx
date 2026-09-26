import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AlumniDetail from "@/components/alumni/alumni-detail"

// Legacy alumni/edit.blade.php — "Detail Alumni"
export const Route = createFileRoute("/_auth/alumni/detail/$alumniId")({
	component: Page,
})

function Page(): JSX.Element {
	const { alumniId } = Route.useParams()
	return <AlumniDetail key={alumniId} alumniId={Number(alumniId)} />
}

export default Page
