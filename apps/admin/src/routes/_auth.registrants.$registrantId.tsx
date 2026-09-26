import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import RegistrantDetailPage from "@/components/registrants/registrant-detail-page"

export const Route = createFileRoute("/_auth/registrants/$registrantId")({
	component: Page,
})

function Page(): JSX.Element {
	const { registrantId } = Route.useParams()
	return <RegistrantDetailPage registrantId={Number(registrantId)} />
}

export default Page
