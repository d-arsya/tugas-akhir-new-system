import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import CapabilityYearTable from "@/components/student-capabilities/capability-year-table"

// Legacy student-capability/academic-year.blade.php (@academicYear + @academicYearList) — level 1
// of the five-level drill-down: pick an academic year.
export const Route = createFileRoute("/_auth/student-capabilities/")({
	component: StudentCapabilityYearsPage,
})

function StudentCapabilityYearsPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle
				title="Kesanggupan"
				breadcrumbs={[{ label: "Pembayaran Santri", to: "/student-capabilities" }, { label: "Kesanggupan" }]}
			/>

			{/* `.row > .col > .card.tbr_card > .card-body.p-4` */}
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<LegacyCard>
						<CapabilityYearTable />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default StudentCapabilityYearsPage
