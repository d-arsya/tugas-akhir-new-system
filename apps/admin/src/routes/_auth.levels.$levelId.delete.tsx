import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LevelDeleteCard from "@/components/levels/level-delete-card"
import { useDeleteLevel } from "@/hooks/use-levels"

// Legacy level/delete/delete.blade.php
export const Route = createFileRoute("/_auth/levels/$levelId/delete")({
	component: LevelDeletePage,
})

function LevelDeletePage(): JSX.Element {
	const { levelId } = Route.useParams()
	const id = Number(levelId)
	const submit = useDeleteLevel(id)

	return (
		<>
			<AdminPageTitle title="Hapus Jenjang" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/levels" }] }, { label: "Akademik", to: "/levels" }, { label: "Jenjang", to: "/levels" }, { label: "Hapus" }]} />

			<LevelDeleteCard levelId={id} step="delete" submit={submit} />
		</>
	)
}

export default LevelDeletePage
