import type { JSX } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import ChartHeading from "@/components/dashboard/chart-heading"
import StudentLineChart from "@/components/dashboard/student-line-chart"
import StudentPieChart from "@/components/dashboard/student-pie-chart"
import SummaryWidgets from "@/components/dashboard/summary-widgets"
import {
	useDashboardChartStudent,
	useDashboardOptions,
	useDashboardPieChart,
	useDashboardStats,
} from "@/hooks/use-dashboard"
import { normalizeRole } from "@/lib/admin-roles"
import useAuthStore from "@/stores/auth.store"

type DashboardSearch = {
	summary_academic_year?: number | undefined
	grade?: number | undefined
}

const toPositiveInt = (value: unknown): number | undefined => {
	const parsed = Number(value)
	return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

// Legacy /dashboard?summary_academic_year=&grade= (DashboardController@index)
export const Route = createFileRoute("/_auth/dashboard")({
	validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
		summary_academic_year: toPositiveInt(search["summary_academic_year"]),
		grade: toPositiveInt(search["grade"]),
	}),
	beforeLoad: () => {
		// Legacy: Kasir E-Wallet is sent straight to the e-wallet page
		if (normalizeRole(useAuthStore.getState().user?.role) === "kasir") {
			throw redirect({ to: "/ewallets" })
		}
	},
	component: DashboardPage,
})

function DashboardPage(): JSX.Element {
	const search = Route.useSearch()
	const navigate = Route.useNavigate()
	const role = normalizeRole(useAuthStore((state) => state.user?.role))
	// Legacy chart endpoints are behind `asAdmin`
	const canViewCharts = role === "superadmin" || role === "admin"

	const academicYearId = search.summary_academic_year
	const grade = search.grade ?? 1

	const { data: options } = useDashboardOptions()
	const { data: stats } = useDashboardStats(academicYearId)
	const { data: chartStudent } = useDashboardChartStudent(grade, canViewCharts)
	const { data: pie } = useDashboardPieChart(canViewCharts)

	const setSearch = (next: DashboardSearch): void => {
		void navigate({ search: (prev) => ({ ...prev, ...next }) })
	}

	return (
		<>
			<AdminPageTitle title="Dashboard" breadcrumbs={[{ label: "Dashboard" }]} />

			<SummaryWidgets
				stats={stats}
				options={options}
				academicYearId={academicYearId}
				onAcademicYearChange={(summary_academic_year) => setSearch({ summary_academic_year })}
			/>

			<div className="mx-[-15px] mt-[16px] mb-[16px] flex flex-wrap min-[992px]:mb-[8px]">
				<div className="w-full px-[15px]">
					<ChartHeading icon="secondary" title="Statistik Data Santri" />
				</div>
			</div>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full px-[15px] min-[992px]:w-1/2">
					<StudentLineChart
						data={chartStudent}
						options={options}
						grade={grade}
						onGradeChange={(nextGrade) => setSearch({ grade: nextGrade })}
					/>
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/2">
					<StudentPieChart data={pie} />
				</div>
			</div>
		</>
	)
}

export default DashboardPage
