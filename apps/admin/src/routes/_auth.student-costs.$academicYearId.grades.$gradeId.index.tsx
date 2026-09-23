import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import StudentCostAccountCard from "@/components/student-costs/student-cost-account-card"
import StudentCostAccountTable from "@/components/student-costs/student-cost-account-table"
import { useStudentCostAccounts } from "@/hooks/use-student-costs"

// Legacy student-cost-term/account.blade.php — level 3, the item table + bulk apply
export const Route = createFileRoute("/_auth/student-costs/$academicYearId/grades/$gradeId/")({
	component: StudentCostAccountsPage,
})

function StudentCostAccountsPage(): JSX.Element {
	const { academicYearId, gradeId } = Route.useParams()
	const { data } = useStudentCostAccounts(Number(academicYearId), Number(gradeId))

	return (
		<>
			{/* The same `account-page-header` as level 2 — the breadcrumb never names the grade */}
			<AdminPageTitle title="Biaya Santri" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/student-costs" }] }, { label: "Keuangan", to: "/student-costs" }, { label: "Biaya Santri", to: "/student-costs" }, { label: data?.academicYear.year ?? "" }]} />

			{/* `.row > .col > .card.tbr_card` */}
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<StudentCostAccountCard
						academicYearId={Number(academicYearId)}
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
