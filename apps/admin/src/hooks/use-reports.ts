import { useEffect } from "react"
import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query"

import type {
	ReportArrearFilterParams,
	ReportArrearPage,
	ReportFilterParams,
	ReportIncomeDetailPage,
	ReportIncomeRecap,
	ReportOptions,
	ReportTableParams,
} from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { adminApi } from "@/lib/api"
import type { TableState } from "@/lib/legacy-table"

export const reportKeys = {
	all: ["admin-reports"] as const,
	options: () => [...reportKeys.all, "options"] as const,
	// `reload` counts "Filter" clicks: legacy reloads the table even when nothing changed
	incomeDetail: (params: ReportFilterParams & ReportTableParams, reload: number) =>
		[...reportKeys.all, "income-detail", params, reload] as const,
	incomeRecap: (params: ReportFilterParams, reload: number) => [...reportKeys.all, "income-recap", params, reload] as const,
	arrears: (params: ReportArrearFilterParams & ReportTableParams, reload: number) =>
		[...reportKeys.all, "arrears", params, reload] as const,
}

// DataTables request → API table params
export const tableParams = (table: TableState): ReportTableParams => ({
	page: table.page,
	limit: table.length,
	sortBy: table.sort?.key,
	sortDir: table.sort?.dir,
})

export const useReportOptions = (): UseQueryResult<ReportOptions> =>
	useQuery({ queryKey: reportKeys.options(), queryFn: () => adminApi.getReportOptions(), staleTime: 5 * 60 * 1000 })

export const useIncomeDetail = (
	params: ReportFilterParams & ReportTableParams,
	reload: number,
): UseQueryResult<ReportIncomeDetailPage> =>
	useQuery({
		queryKey: reportKeys.incomeDetail(params, reload),
		queryFn: () => adminApi.getReportIncomeDetail(params),
		// Keep the rows on screen under the "Sedang memproses" overlay, like DataTables
		placeholderData: keepPreviousData,
	})

// Legacy creates the recap DataTable on the first `shown.bs.tab`
export const useIncomeRecap = (
	params: ReportFilterParams,
	reload: number,
	enabled: boolean,
): UseQueryResult<ReportIncomeRecap> =>
	useQuery({
		queryKey: reportKeys.incomeRecap(params, reload),
		queryFn: () => adminApi.getReportIncomeRecap(params),
		placeholderData: keepPreviousData,
		enabled,
	})

export const useArrears = (
	params: ReportArrearFilterParams & ReportTableParams,
	reload: number,
): UseQueryResult<ReportArrearPage> =>
	useQuery({
		queryKey: reportKeys.arrears(params, reload),
		queryFn: () => adminApi.getReportArrears(params),
		placeholderData: keepPreviousData,
	})

// DataTables `ajax.error` in the legacy report scripts
export const useLegacyLoadError = (isError: boolean): void => {
	useEffect(() => {
		if (isError) legacyNotify.error("Terjadi kesalahan pada sistem. Silakan reload ulang halaman ini.")
	}, [isError])
}
