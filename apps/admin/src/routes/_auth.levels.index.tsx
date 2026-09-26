import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import LevelForm from "@/components/levels/level-form"
import LevelTable from "@/components/levels/level-table"

export const Route = createFileRoute("/_auth/levels/")({
	component: LevelsIndexPage,
})

function LevelsIndexPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle title="Jenjang" breadcrumbs={[{ label: "Data Master", to: "/levels" }, { label: "Akademik", to: "/levels" }, { label: "Jenjang" }]} />

			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="w-full px-[15px] min-[992px]:max-w-[33.333333%] min-[992px]:flex-[0_0_33.333333%]">
					<LevelForm />
				</div>
				<div className="w-full px-[15px] min-[992px]:max-w-[66.666667%] min-[992px]:flex-[0_0_66.666667%]">
					<LegacyCard>
						<LevelTable />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default LevelsIndexPage
