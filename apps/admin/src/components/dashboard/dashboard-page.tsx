import type { JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import {
	useDashboardChartStudent,
	useDashboardOptions,
	useDashboardPieChart,
	useDashboardStats,
} from "@/hooks/use-dashboard"
import { normalizeRole } from "@/lib/admin-roles"
import useAuthStore from "@/stores/auth.store"

import ChartHeading from "./chart-heading"
import StudentLineChart from "./student-line-chart"
import StudentPieChart from "./student-pie-chart"
import SummaryWidgets from "./summary-widgets"

export type DashboardSearch = {
	summary_academic_year?: number | undefined
	grade?: number | undefined
}

type DashboardPageProps = { search: DashboardSearch }

const DashboardPage = ({ search }: DashboardPageProps): JSX.Element => {
	const navigate = useNavigate({ from: "/dashboard" })
	const role = normalizeRole(useAuthStore((state) => state.user?.role))
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
