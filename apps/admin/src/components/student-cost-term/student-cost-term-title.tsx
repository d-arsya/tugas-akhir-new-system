import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentCostTermDetail } from "@roja/types"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"

type StudentCostTermTitleProps = {
	academicYearId: string
	gradeId: string
	detail: StudentCostTermDetail | undefined
}

const StudentCostTermTitle = ({ academicYearId, gradeId, detail }: StudentCostTermTitleProps): JSX.Element => {
	const yearLabel = detail?.academicYear.year ?? "Tahun Ajaran"
	const gradeLabel = detail ? `Kelas ${detail.grade.label ?? ""}`.trim() : "Kelas"

	return (
		<AdminPageTitle
			title="Detail Biaya Santri"
			breadcrumbs={[
				{
					label: "…",
					dropdown: [
						{ label: "Data Master", to: "/student-costs" },
						{ label: "Keuangan", to: "/student-costs" },
						{ label: "Biaya Santri", to: "/student-costs" },
					],
				},
				{
					label: yearLabel,
					node: (
						<Link to="/student-costs/$academicYearId" params={{ academicYearId }} className={CRUMB_LINK_CLASS}>
							{yearLabel}
						</Link>
					),
				},
				{
					label: gradeLabel,
					node: (
						<Link
							to="/student-costs/$academicYearId/grades/$gradeId"
							params={{ academicYearId, gradeId }}
							className={CRUMB_LINK_CLASS}
						>
							{gradeLabel}
						</Link>
					),
				},
				{ label: "Detail" },
			]}
		/>
	)
}

export default StudentCostTermTitle
