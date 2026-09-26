import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import LevelDelegatePage from "@/components/levels/level-delegate-page"

export const Route = createFileRoute("/_auth/levels/$levelId/delegate-major")({
	component: LevelDelegateMajorRoute,
})

function LevelDelegateMajorRoute(): JSX.Element {
	const { levelId } = Route.useParams()
	return <LevelDelegatePage levelId={Number(levelId)} step="delegate-major" />
}

export default LevelDelegateMajorRoute
