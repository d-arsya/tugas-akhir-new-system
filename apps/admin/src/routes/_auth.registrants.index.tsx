import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import RegistrantYearTable from "@/components/registrants/registrant-year-table"

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
			<LegacyCard>
				<RegistrantYearTable />
			</LegacyCard>
		</>
	)
}

export default Page
