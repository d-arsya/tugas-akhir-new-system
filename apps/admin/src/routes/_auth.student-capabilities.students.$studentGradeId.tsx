import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import CapabilityHistoryPage from "@/components/student-capabilities/capability-history-page"

export const Route = createFileRoute("/_auth/student-capabilities/students/$studentGradeId")({
	component: StudentCapabilityHistoryPage,
})

function StudentCapabilityHistoryPage(): JSX.Element {
	const { studentGradeId } = Route.useParams()
	return <CapabilityHistoryPage studentGradeId={Number(studentGradeId)} />
}

export default StudentCapabilityHistoryPage
