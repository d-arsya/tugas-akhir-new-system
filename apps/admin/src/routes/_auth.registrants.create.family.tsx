import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import RegistrantWizard from "@/components/registrants/registrant-wizard"

// Legacy registrant/create/data/family.blade.php — step "family" of the PSB create wizard ("Tambah PSB").
export const Route = createFileRoute("/_auth/registrants/create/family")({
	component: Page,
})

function Page(): JSX.Element {
	return <RegistrantWizard step="family" />
}

export default Page
