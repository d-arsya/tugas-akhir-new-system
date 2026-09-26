import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import StudentYearTable from "@/components/students/student-year-table"

// Legacy student/index.blade.php (+ partials/index-page-header.blade.php) — Data Santri, pick an academic year.
export const Route = createFileRoute("/_auth/students/")({
	component: Page,
})

function Page(): JSX.Element {
	return (
		<>
			<AdminPageTitle
				title="Data Santri - Pilih Tahun Ajaran"
				breadcrumbs={[{ label: "Akademik", to: "/students" }, { label: "Santri", to: "/students" }, { label: "Data Santri" }]}
			/>

			{/* `.row > .col > .card.tbr_card > .card-body.p-4` */}
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<LegacyCard>
						<StudentYearTable />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default Page
