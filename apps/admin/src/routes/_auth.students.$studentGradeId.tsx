import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentDetailPage from "@/components/students/student-detail-page"

export const Route = createFileRoute("/_auth/students/$studentGradeId")({
	component: Page,
})

function Page(): JSX.Element {
	const { studentGradeId } = Route.useParams()
	return <StudentDetailPage studentGradeId={Number(studentGradeId)} />
}

export default Page
