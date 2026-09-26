import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import CapabilityItemsPage from "@/components/student-capabilities/capability-items-page"

export const Route = createFileRoute("/_auth/student-capabilities/$capabilityId/students/$studentGradeId")({
	component: StudentCapabilityItemsPage,
})

function StudentCapabilityItemsPage(): JSX.Element {
	const { capabilityId, studentGradeId } = Route.useParams()
	return <CapabilityItemsPage capabilityId={Number(capabilityId)} studentGradeId={Number(studentGradeId)} />
}

export default StudentCapabilityItemsPage
