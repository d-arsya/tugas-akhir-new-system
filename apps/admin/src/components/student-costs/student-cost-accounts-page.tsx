import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useStudentCostAccounts } from "@/hooks/use-student-costs"

import StudentCostAccountCard from "./student-cost-account-card"
import StudentCostAccountTable from "./student-cost-account-table"

type StudentCostAccountsPageProps = { academicYearId: number; gradeId: number }

const StudentCostAccountsPage = ({ academicYearId, gradeId }: StudentCostAccountsPageProps): JSX.Element => {
	const { data } = useStudentCostAccounts(academicYearId, gradeId)

	return (
		<>
			<AdminPageTitle title="Biaya Santri" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/student-costs" }] }, { label: "Keuangan", to: "/student-costs" }, { label: "Biaya Santri", to: "/student-costs" }, { label: data?.academicYear.year ?? "" }]} />

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<StudentCostAccountCard
						academicYearId={academicYearId}
						year={data?.academicYear.year ?? null}
						costPeriod={data?.academicYear.costPeriod ?? ""}
						gradeLabel={data?.grade.label ?? null}
					>
						{data ? <StudentCostAccountTable page={data} /> : null}
					</StudentCostAccountCard>
				</div>
			</div>
		</>
	)
}

export default StudentCostAccountsPage
