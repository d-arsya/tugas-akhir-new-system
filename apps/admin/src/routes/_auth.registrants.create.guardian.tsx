import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import RegistrantWizard from "@/components/registrants/registrant-wizard"

// Legacy registrant/create/data/guardian.blade.php — step "guardian" of the PSB create wizard ("Tambah PSB").
export const Route = createFileRoute("/_auth/registrants/create/guardian")({
	component: Page,
})

function Page(): JSX.Element {
	return <RegistrantWizard step="guardian" />
}

export default Page
