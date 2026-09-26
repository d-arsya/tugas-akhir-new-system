import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import RegistrantWizard from "@/components/registrants/registrant-wizard"

// Legacy registrant/create/data/personal.blade.php — step "personal" of the PSB create wizard ("Tambah PSB").
export const Route = createFileRoute("/_auth/registrants/create/")({
	component: Page,
})

function Page(): JSX.Element {
	return <RegistrantWizard step="personal" />
}

export default Page
