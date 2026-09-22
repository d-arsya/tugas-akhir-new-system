import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { DashboardChartItem, DashboardOptions, DashboardPieItem, DashboardStats } from "@roja/types"

import { adminApi } from "@/lib/api"

export const dashboardKeys = {
	all: ["admin", "dashboard"] as const,
	stats: (academicYearId: number | undefined) => [...dashboardKeys.all, "stats", academicYearId ?? "all"] as const,
	options: () => [...dashboardKeys.all, "options"] as const,
	chartStudent: (grade: number) => [...dashboardKeys.all, "chart-student", grade] as const,
	pie: () => [...dashboardKeys.all, "pie"] as const,
}

export const useDashboardStats = (academicYearId: number | undefined): UseQueryResult<DashboardStats> =>
	useQuery({
		queryKey: dashboardKeys.stats(academicYearId),
		queryFn: () => adminApi.getDashboardStats({ academicYearId }),
		placeholderData: keepPreviousData,
	})

export const useDashboardOptions = (): UseQueryResult<DashboardOptions> =>
	useQuery({
		queryKey: dashboardKeys.options(),
		queryFn: () => adminApi.getDashboardOptions(),
		staleTime: 5 * 60 * 1000,
	})

// Charts are Superadmin/Admin only (legacy `asAdmin`); other roles get an empty chart
export const useDashboardChartStudent = (grade: number, enabled: boolean): UseQueryResult<DashboardChartItem[]> =>
	useQuery({
		queryKey: dashboardKeys.chartStudent(grade),
		queryFn: () => adminApi.getDashboardChartStudent({ grade }),
		enabled,
		placeholderData: keepPreviousData,
	})

export const useDashboardPieChart = (enabled: boolean): UseQueryResult<DashboardPieItem[]> =>
	useQuery({
		queryKey: dashboardKeys.pie(),
		queryFn: () => adminApi.getDashboardPieChart(),
		enabled,
	})
