import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentWizard from "@/components/students/student-wizard"

// Legacy student/create/data/guardian.blade.php — step of the Tambah Santri wizard (`Student\GuardianController`).
export const Route = createFileRoute("/_auth/students/create/guardian")({
	component: Page,
})

function Page(): JSX.Element {
	return <StudentWizard step="guardian" />
}

export default Page
