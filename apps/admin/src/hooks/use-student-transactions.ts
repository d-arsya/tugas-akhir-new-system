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

export const studentTransactionKeys = {
	all: ["admin-student-transactions"] as const,
	list: () => [...studentTransactionKeys.all, "list"] as const,
	detail: (transactionId: number) => [...studentTransactionKeys.all, "detail", transactionId] as const,
}

export type TransactionDateRange = { from: string; to: string }

export const useStudentTransactionTable = (
	range: TransactionDateRange,
): UseServerTableResult<StudentTransactionListRow> =>
	useServerTable<StudentTransactionListRow, TransactionDateRange>({
		queryKey: studentTransactionKeys.list(),
		fetcher: (query: StudentTransactionListQuery): Promise<ServerTableResult<StudentTransactionListRow>> =>
			adminApi.getTransactionRows(query),
		extra: range,
	})

export const useStudentTransaction = (transactionId: number): UseQueryResult<StudentTransactionDetail> =>
	useQuery({
		queryKey: studentTransactionKeys.detail(transactionId),
		queryFn: () => adminApi.getTransactionDetail(transactionId),
	})

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
