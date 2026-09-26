import type { JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

import AcademicYearTable from "@/components/academic-years/academic-year-table"
import AdminPageTitle from "@/components/layout/admin-page-title"
import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"

export const Route = createFileRoute("/_auth/academic-years/")({
	component: AcademicYearsIndexPage,
})

function AcademicYearsIndexPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle title="Semua Tahun Ajaran" breadcrumbs={[{ label: "Data Master", to: "/academic-years" }, { label: "Tahun Ajaran", to: "/academic-years" }, { label: "Semua" }]} />

			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<div className="text-right">
						<Link to="/academic-years/create" className={legacyButtonClass("primary", "mb-[16px]")}>
							Tambah Tahun Ajaran
						</Link>
					</div>
					<LegacyCard bodyClassName="p-[20px]">
						<div className="pt-[4px]">
							<AcademicYearTable />
						</div>
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default AcademicYearsIndexPage
