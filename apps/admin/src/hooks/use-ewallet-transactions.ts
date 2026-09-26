import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminMessageResult,
	EwalletHistoryDetail,
	EwalletHistoryExportQuery,
	EwalletHistoryQuery,
	EwalletHistoryRow,
	EwalletTransactionDetail,
	EwalletTransactionKind,
	EwalletTransactionStatus,
	EwalletTransactionUpdateDto,
	ServerTableResult,
} from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { ewalletKeys } from "@/hooks/use-ewallets"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { legacyErrors } from "@/lib/legacy-errors"
import useServerTable, { type UseServerTableResult } from "@/hooks/use-server-table"

// Nested under ewalletKeys.all so one invalidation refreshes balances, lists, Riwayat and the sidebar badge
export const ewalletTransactionKeys = {
	all: [...ewalletKeys.all, "txn"] as const,
	detail: (transactionId: number) => [...ewalletTransactionKeys.all, "detail", transactionId] as const,
	history: () => [...ewalletTransactionKeys.all, "history"] as const,
	historyDetail: (transactionId: number) => [...ewalletTransactionKeys.all, "history-detail", transactionId] as const,
}

export const useEwalletTransaction = (transactionId: number): UseQueryResult<EwalletTransactionDetail> =>
	useQuery({
		queryKey: ewalletTransactionKeys.detail(transactionId),
		queryFn: () => adminApi.getEwalletTransactionDetail(transactionId),
		staleTime: 0,
	})

export const useUpdateEwalletTransaction = (
	transactionId: number,
): UseMutationResult<AdminMessageResult, unknown, EwalletTransactionUpdateDto> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: EwalletTransactionUpdateDto) => adminApi.updateEwalletTransaction(transactionId, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ewalletKeys.all })
		},
	})
}

export type EwalletHistoryDateRange = { from: string; to: string }

export type EwalletHistoryFilters = { status: string; type: string }

const historyDateParam = (range: EwalletHistoryDateRange, today: string): string | undefined => {
	if (range.from === "") return undefined
	return `${range.from} - ${range.to === "" ? today : range.to}`
}

export type EwalletHistoryExtra = Pick<EwalletHistoryQuery, "date" | "status" | "type">

export const historyCriteria = (
	range: EwalletHistoryDateRange,
	filters: EwalletHistoryFilters,
	today: string,
): EwalletHistoryExtra => {
	const date = historyDateParam(range, today)
	return {
		...(date ? { date } : {}),
		...(filters.status ? { status: filters.status as EwalletTransactionStatus } : {}),
		...(filters.type ? { type: filters.type as EwalletTransactionKind } : {}),
	}
}

export const useEwalletHistoryTable = (extra: EwalletHistoryExtra): UseServerTableResult<EwalletHistoryRow> =>
	useServerTable<EwalletHistoryRow, EwalletHistoryExtra>({
		queryKey: ewalletTransactionKeys.history(),
		fetcher: (query: EwalletHistoryQuery): Promise<ServerTableResult<EwalletHistoryRow>> =>
			adminApi.getEwalletHistoryRows(query),
		extra,
		staleTime: 0,
	})

export const useEwalletHistoryDetail = (transactionId: number): UseQueryResult<EwalletHistoryDetail> =>
	useQuery({
		queryKey: ewalletTransactionKeys.historyDetail(transactionId),
		queryFn: () => adminApi.getEwalletHistoryDetail(transactionId),
	})

export const useDownloadEwalletHistory = (): UseMutationResult<void, unknown, EwalletHistoryExportQuery> =>
	useMutation<void, unknown, EwalletHistoryExportQuery>({
		mutationFn: async (query) => {
			const { blob, fileName } = await adminApi.downloadEwalletHistoryReport(query)
			saveBlob(blob, fileName ?? "Laporan Riwayat Transaksi.xlsx")
		},
		onError: (error) => legacyNotify.error(legacyErrors(error)),
	})
