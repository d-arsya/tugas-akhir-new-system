import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import RegistrantWizard from "@/components/registrants/registrant-wizard"

// Legacy registrant/create/data/attachment.blade.php — step "attachment" of the PSB create wizard ("Tambah PSB").
export const Route = createFileRoute("/_auth/registrants/create/attachment")({
	component: Page,
})

function Page(): JSX.Element {
	return <RegistrantWizard step="attachment" />
}

export default Page
