import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import { useStudentCostYears } from "@/hooks/use-student-costs"

import StudentCostGradeTable from "./student-cost-grade-table"

const StudentCostGradesPage = ({ academicYearId }: { academicYearId: number }): JSX.Element => {
	const { data: years } = useStudentCostYears()
	const year = years?.find((row) => row.id === academicYearId)?.year ?? ""

	return (
		<>
			<AdminPageTitle title="Biaya Santri" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/student-costs" }] }, { label: "Keuangan", to: "/student-costs" }, { label: "Biaya Santri", to: "/student-costs" }, { label: year }]} />

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<LegacyCard>
						<StudentCostGradeTable academicYearId={academicYearId} />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default StudentCostGradesPage
