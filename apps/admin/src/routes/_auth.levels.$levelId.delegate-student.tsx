import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import LevelDelegatePage from "@/components/levels/level-delegate-page"

export const Route = createFileRoute("/_auth/levels/$levelId/delegate-student")({
	component: LevelDelegateStudentRoute,
})

function LevelDelegateStudentRoute(): JSX.Element {
	const { levelId } = Route.useParams()
	return <LevelDelegatePage levelId={Number(levelId)} step="delegate-student" />
}

export default LevelDelegateStudentRoute
