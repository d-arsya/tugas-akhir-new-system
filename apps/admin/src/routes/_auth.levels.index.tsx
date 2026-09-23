import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import LevelForm from "@/components/levels/level-form"
import LevelTable from "@/components/levels/level-table"

// Legacy level/index.blade.php
export const Route = createFileRoute("/_auth/levels/")({
	component: LevelsIndexPage,
})

function LevelsIndexPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle title="Jenjang" breadcrumbs={[{ label: "Data Master", to: "/levels" }, { label: "Akademik", to: "/levels" }, { label: "Jenjang" }]} />

			{/* `.row.justify-content-center > .col-xl-4 + .col-xl-8` (both `col-lg-*` at the same split) */}
			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="w-full px-[15px] min-[992px]:max-w-[33.333333%] min-[992px]:flex-[0_0_33.333333%]">
					<LevelForm />
				</div>
				<div className="w-full px-[15px] min-[992px]:max-w-[66.666667%] min-[992px]:flex-[0_0_66.666667%]">
					{/* `.card.tbr_card > .card-body.p-4` — no `overflow-hidden` here, unlike the
					    Pengelola blade; the table scrolls inside its own `.table-responsive`. */}
					<LegacyCard>
						<LevelTable />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default LevelsIndexPage
