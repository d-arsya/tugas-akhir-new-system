import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminMessageResult,
	ServerTableResult,
	StudentTransactionDetail,
	StudentTransactionListQuery,
	StudentTransactionListRow,
	UpdateTransactionNoteDto,
} from "@roja/types"

import { adminApi } from "@/lib/api"
import useServerTable, { type UseServerTableResult } from "@/hooks/use-server-table"

// Legacy `StudentTransactionController` — Riwayat Transaksi. Owned by WS P1-C.

export const studentTransactionKeys = {
	all: ["admin-student-transactions"] as const,
	list: () => [...studentTransactionKeys.all, "list"] as const,
	detail: (transactionId: number) => [...studentTransactionKeys.all, "detail", transactionId] as const,
}

/** `student-transaction/index.blade.php:42-60` — the two datepickers, `dd/mm/yyyy`. */
export type TransactionDateRange = { from: string; to: string }

/**
 * `@listTransactionServer`. `serverSide: true` in legacy
 * (`student-transaction-serverside.js:22`), so the table state is the query key.
 *
 * The date range is sent on every draw (`student-transaction-serverside.js:47-53` pushes
 * `d.from` / `d.to` into the ajax payload) but the server ignores it whenever the search box
 * has a value — legacy's `filter()` uses `else if` (`:136`), so the two are mutually
 * exclusive. Kept as legacy.
 */
export const useStudentTransactionTable = (
	range: TransactionDateRange,
): UseServerTableResult<StudentTransactionListRow> =>
	useServerTable<StudentTransactionListRow, TransactionDateRange>({
		queryKey: studentTransactionKeys.list(),
		fetcher: (query: StudentTransactionListQuery): Promise<ServerTableResult<StudentTransactionListRow>> =>
			adminApi.getTransactionRows(query),
		extra: range,
	})

/** `@edit:235-261` — `student-transaction/detail.blade.php`. */
export const useStudentTransaction = (transactionId: number): UseQueryResult<StudentTransactionDetail> =>
	useQuery({
		queryKey: studentTransactionKeys.detail(transactionId),
		queryFn: () => adminApi.getTransactionDetail(transactionId),
	})

/**
 * The "Catatan bila diperlukan" form at `detail.blade.php:148-173`, which posts to
 * `studentInvoice.updateTransaction` — P1-B's endpoint, reached through the shared api-client.
 */
export const useUpdateTransactionNote = (
	transactionId: number,
): UseMutationResult<AdminMessageResult, unknown, UpdateTransactionNoteDto> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: UpdateTransactionNoteDto) => adminApi.updateTransactionNote(transactionId, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: studentTransactionKeys.detail(transactionId) })
		},
	})
}
