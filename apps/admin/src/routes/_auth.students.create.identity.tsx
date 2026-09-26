import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentWizard from "@/components/students/student-wizard"

export const Route = createFileRoute("/_auth/students/create/identity")({
	component: Page,
})

function Page(): JSX.Element {
	return <StudentWizard step="identity" />
}

export default Page
