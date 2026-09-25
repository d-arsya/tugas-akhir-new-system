import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminMessageResult,
	EwalletHistoryDetail,
	EwalletHistoryExportQuery,
	EwalletHistoryQuery,
	EwalletHistoryRow,
	EwalletTransactionDetail,
	EwalletTransactionUpdateDto,
	ServerTableResult,
} from "@roja/types"

import { ewalletKeys } from "@/hooks/use-ewallets"
import { adminApi } from "@/lib/api"
import useServerTable, { type UseServerTableResult } from "@/hooks/use-server-table"

// Legacy `EwalletController@transactionDetail` / `@transactionUpdate` and
// `EwalletTransactionHistoryController` (Dompet ▸ Riwayat Transaksi). Owned by WS D-C.

// Under the same root as `ewalletKeys` on purpose: a top-up or withdraw (D-B) changes what Riwayat lists, and a
// status change here changes the balances, the Akun list and the sidebar badge — one `invalidateQueries` on
// `ewalletKeys.all` from either side has to reach both.
export const ewalletTransactionKeys = {
	all: [...ewalletKeys.all, "txn"] as const,
	detail: (transactionId: number) => [...ewalletTransactionKeys.all, "detail", transactionId] as const,
	history: () => [...ewalletTransactionKeys.all, "history"] as const,
	historyDetail: (transactionId: number) => [...ewalletTransactionKeys.all, "history-detail", transactionId] as const,
}

/** `ewallet/transaction-detail/index.blade.php` — Cash or Bank Transfer (Manual). */
export const useEwalletTransaction = (transactionId: number): UseQueryResult<EwalletTransactionDetail> =>
	useQuery({
		queryKey: ewalletTransactionKeys.detail(transactionId),
		queryFn: () => adminApi.getEwalletTransactionDetail(transactionId),
		staleTime: 0,
	})

/** The two confirmation forms post the same PATCH; legacy reloads the page 1000 ms after the notice. */
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

/** The `dd/mm/yyyy` pickers of `transaction-history/index.blade.php`, `""` when empty. */
export type EwalletHistoryDateRange = { from: string; to: string }

/** The advanced filter card (`#ewallet` status, `#type`). `""` = the placeholder option. */
export type EwalletHistoryFilters = { status: string; type: string }

/**
 * `date` as the page writes it into `#ewallet_date-export--filter`: a start with no end
 * defaults the end to today (`$('#date_start').on("change")`); an end with no start is what
 * legacy posted as `" - dd/mm/yyyy"` and 500'd on, so it is dropped here.
 */
export const historyDateParam = (range: EwalletHistoryDateRange, today: string): string | undefined => {
	if (range.from === "") return undefined
	return `${range.from} - ${range.to === "" ? today : range.to}`
}

export type EwalletHistoryExtra = Pick<EwalletHistoryQuery, "date" | "status" | "type">

/** Legacy `initTransactionHistoryEwalletDT` — server-side, `created_at` descending. */
export const useEwalletHistoryTable = (extra: EwalletHistoryExtra): UseServerTableResult<EwalletHistoryRow> =>
	useServerTable<EwalletHistoryRow, EwalletHistoryExtra>({
		queryKey: ewalletTransactionKeys.history(),
		fetcher: (query: EwalletHistoryQuery): Promise<ServerTableResult<EwalletHistoryRow>> =>
			adminApi.getEwalletHistoryRows(query),
		extra,
		staleTime: 0,
	})

/** `EwalletTransactionHistoryController@detail`. */
export const useEwalletHistoryDetail = (transactionId: number): UseQueryResult<EwalletHistoryDetail> =>
	useQuery({
		queryKey: ewalletTransactionKeys.historyDetail(transactionId),
		queryFn: () => adminApi.getEwalletHistoryDetail(transactionId),
	})

/** The export form's GET; the caller saves the blob. */
export const downloadEwalletHistory = (
	query: EwalletHistoryExportQuery,
): Promise<{ blob: Blob; fileName: string | null }> => adminApi.downloadEwalletHistoryReport(query)
