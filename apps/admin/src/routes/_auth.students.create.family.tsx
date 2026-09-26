import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentWizard from "@/components/students/student-wizard"

// Legacy student/create/data/family.blade.php — step of the Tambah Santri wizard (`Student\FamilyController`).
export const Route = createFileRoute("/_auth/students/create/family")({
	component: Page,
})

function Page(): JSX.Element {
	return <StudentWizard step="family" />
}

export default Page
