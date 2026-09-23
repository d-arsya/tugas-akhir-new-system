import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LevelDeleteCard from "@/components/levels/level-delete-card"
import { useDelegateLevel } from "@/hooks/use-levels"

// Legacy level/delete/delegate-grade.blade.php — the heading keeps the space before its colon, verbatim.
const HEADING = "Pindahkan data kelas ke jenjang lain :"

export const Route = createFileRoute("/_auth/levels/$levelId/delegate-grade")({
	component: LevelDelegateGradePage,
})

function LevelDelegateGradePage(): JSX.Element {
	const { levelId } = Route.useParams()
	const id = Number(levelId)
	const submit = useDelegateLevel(id, "delegate-grade")

	return (
		<>
			<AdminPageTitle title="Hapus Jenjang" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/levels" }] }, { label: "Akademik", to: "/levels" }, { label: "Jenjang", to: "/levels" }, { label: "Hapus" }]} />

			<LevelDeleteCard levelId={id} step="delegate-grade" heading={HEADING} noun="kelas" submit={submit} />
		</>
	)
}

export default LevelDelegateGradePage
