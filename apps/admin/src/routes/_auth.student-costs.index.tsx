import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import StudentCostYearTable from "@/components/student-costs/student-cost-year-table"

export const Route = createFileRoute("/_auth/student-costs/")({
	component: StudentCostYearsPage,
})

function StudentCostYearsPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle
				title="Biaya Santri"
				breadcrumbs={[
					{ label: "Data Master", to: "/student-costs" },
					{ label: "Keuangan", to: "/student-costs" },
					{ label: "Biaya Santri" },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<LegacyCard>
						<StudentCostYearTable />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default StudentCostYearsPage
