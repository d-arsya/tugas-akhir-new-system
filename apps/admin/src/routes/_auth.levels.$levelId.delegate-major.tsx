import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LevelDeleteCard from "@/components/levels/level-delete-card"
import { useDelegateLevel } from "@/hooks/use-levels"

// Legacy level/delete/delegate-major.blade.php — the heading keeps the space before its colon, verbatim.
const HEADING = "Pindahkan data jurusan ke jenjang lain :"

export const Route = createFileRoute("/_auth/levels/$levelId/delegate-major")({
	component: LevelDelegateMajorPage,
})

function LevelDelegateMajorPage(): JSX.Element {
	const { levelId } = Route.useParams()
	const id = Number(levelId)
	const submit = useDelegateLevel(id, "delegate-major")

	return (
		<>
			<AdminPageTitle title="Hapus Jenjang" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/levels" }] }, { label: "Akademik", to: "/levels" }, { label: "Jenjang", to: "/levels" }, { label: "Hapus" }]} />

			<LevelDeleteCard levelId={id} step="delegate-major" heading={HEADING} noun="jurusan" submit={submit} />
		</>
	)
}

export default LevelDelegateMajorPage
