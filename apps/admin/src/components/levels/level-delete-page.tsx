import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useDeleteLevel } from "@/hooks/use-levels"

import LevelDeleteCard from "./level-delete-card"

const LevelDeletePage = ({ levelId }: { levelId: number }): JSX.Element => {
	const submit = useDeleteLevel(levelId)

	return (
		<>
			<AdminPageTitle title="Hapus Jenjang" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/levels" }] }, { label: "Akademik", to: "/levels" }, { label: "Jenjang", to: "/levels" }, { label: "Hapus" }]} />

			<LevelDeleteCard levelId={levelId} step="delete" submit={submit} />
		</>
	)
}

export default LevelDeletePage
