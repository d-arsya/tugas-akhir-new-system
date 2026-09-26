import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import LevelDeletePage from "@/components/levels/level-delete-page"

export const Route = createFileRoute("/_auth/levels/$levelId/delete")({
	component: LevelDeleteRoute,
})

function LevelDeleteRoute(): JSX.Element {
	const { levelId } = Route.useParams()
	return <LevelDeletePage levelId={Number(levelId)} />
}

export default LevelDeleteRoute
