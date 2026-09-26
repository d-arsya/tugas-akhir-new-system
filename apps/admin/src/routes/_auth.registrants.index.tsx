import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import RegistrantYearTable from "@/components/registrants/registrant-year-table"

// Legacy registrant/index.blade.php (+ partials/index-page-header.blade.php) — "Data PSB - Pilih Tahun Ajaran".
export const Route = createFileRoute("/_auth/registrants/")({
	component: Page,
})

function Page(): JSX.Element {
	return (
		<>
			<AdminPageTitle
				title="Data PSB - Pilih Tahun Ajaran"
				breadcrumbs={[{ label: "Akademik", to: "/registrants" }, { label: "PSB", to: "/registrants" }, { label: "Data PSB" }]}
			/>
			{/* `.row > .col > .card.tbr_card > .card-body.p-4` */}
			<LegacyCard>
				<RegistrantYearTable />
			</LegacyCard>
		</>
	)
}

export default Page
