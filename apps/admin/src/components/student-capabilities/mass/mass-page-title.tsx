import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { CapabilityMassPage } from "@roja/types"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"

type MassPageTitleProps = {
	academicYearId: string
	gradeId: string
	page: CapabilityMassPage | undefined
}

const MassPageTitle = ({ academicYearId, gradeId, page }: MassPageTitleProps): JSX.Element => (
	<AdminPageTitle
		title="Kesanggupan"
		breadcrumbs={[
			{ label: "…", dropdown: [{ label: "Pembayaran Santri", to: "/student-capabilities" }, { label: "Kesanggupan", to: "/student-capabilities" }] },
			{
				label: page?.academicYear.year ?? "",
				node: (
					<Link to="/student-capabilities/academic-years/$academicYearId" params={{ academicYearId }} className={CRUMB_LINK_CLASS}>
						{page?.academicYear.year ?? ""}
					</Link>
				),
			},
			{
				label: `Kelas ${page?.grade.label ?? ""}`,
				node: (
					<Link
						to="/student-capabilities/academic-years/$academicYearId/grades/$gradeId"
						params={{ academicYearId, gradeId }}
						className={CRUMB_LINK_CLASS}
					>
						Kelas {page?.grade.label ?? ""}
					</Link>
				),
			},
			{ label: "Buat kesanggupan masal" },
		]}
	/>
)

export default MassPageTitle
