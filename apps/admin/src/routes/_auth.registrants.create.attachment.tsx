import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import RegistrantWizard from "@/components/registrants/registrant-wizard"

export const Route = createFileRoute("/_auth/registrants/create/attachment")({
	component: Page,
})

function Page(): JSX.Element {
	return <RegistrantWizard step="attachment" />
}

export default Page
