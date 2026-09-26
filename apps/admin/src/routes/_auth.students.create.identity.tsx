import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentWizard from "@/components/students/student-wizard"

// Legacy student/create/data/identity.blade.php — step of the Tambah Santri wizard (`Student\IdentityController`).
export const Route = createFileRoute("/_auth/students/create/identity")({
	component: Page,
})

function Page(): JSX.Element {
	return <StudentWizard step="identity" />
}

export default Page
