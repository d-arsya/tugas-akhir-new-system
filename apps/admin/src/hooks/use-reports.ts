import { keepPreviousData, useMutation, useQuery, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	ReportArrearFilterParams,
	ReportArrearPage,
	ReportExportKind,
	ReportFilterParams,
	ReportIncomeDetailPage,
	ReportIncomeRecap,
	ReportOptions,
	ReportTableParams,
} from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { SYSTEM_ERROR } from "@/lib/legacy-errors"
import type { TableState } from "@/lib/legacy-table"

const EXPORT_FILE_NAMES: Record<ReportExportKind, string> = {
	"income-detail": "Laporan Pembayaran Santri (Rincian).xlsx",
	"income-recap": "Laporan Pembayaran Santri (Rekapitulasi).xlsx",
	arrears: "Laporan Tunggakan Pembayaran Santri.xlsx",
}

export const reportKeys = {
	all: ["admin-reports"] as const,
	options: () => [...reportKeys.all, "options"] as const,
	incomeDetail: (params: ReportFilterParams & ReportTableParams, reload: number) =>
		[...reportKeys.all, "income-detail", params, reload] as const,
	incomeRecap: (params: ReportFilterParams, reload: number) => [...reportKeys.all, "income-recap", params, reload] as const,
	arrears: (params: ReportArrearFilterParams & ReportTableParams, reload: number) =>
		[...reportKeys.all, "arrears", params, reload] as const,
}

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
		placeholderData: keepPreviousData,
	})

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

type ReportDownload = { kind: ReportExportKind; params: ReportArrearFilterParams }

export const useDownloadReport = (): UseMutationResult<void, unknown, ReportDownload> =>
	useMutation<void, unknown, ReportDownload>({
		mutationFn: async ({ kind, params }) => {
			const { blob, fileName } = await adminApi.downloadReport(kind, params)
			saveBlob(blob, fileName ?? EXPORT_FILE_NAMES[kind])
		},
		onError: () => legacyNotify.error(SYSTEM_ERROR),
	})
