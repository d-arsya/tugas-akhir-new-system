import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import RegistrantWizard from "@/components/registrants/registrant-wizard"

// Legacy registrant/create/data/identity.blade.php — step "identity" of the PSB create wizard ("Tambah PSB").
export const Route = createFileRoute("/_auth/registrants/create/identity")({
	component: Page,
})

function Page(): JSX.Element {
	return <RegistrantWizard step="identity" />
}

export default Page
