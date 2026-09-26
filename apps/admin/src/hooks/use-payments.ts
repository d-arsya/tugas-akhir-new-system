import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminMessageResult,
	CancelTransactionDto,
	CreateTransactionDto,
	CreateTransactionResult,
	InvoiceSelectionResult,
	UpdateTransactionNoteDto,
} from "@roja/types"

import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"
import { studentInvoiceKeys } from "@/hooks/use-student-invoices"
import { studentTransactionKeys } from "@/hooks/use-student-transactions"
import { saveBlob } from "@/lib/download"
import { adminApi } from "@/lib/api"

export const paymentKeys = {
	all: ["admin-payments"] as const,
	selection: (studentGradeId: number, invoiceIds: readonly number[]) =>
		[...paymentKeys.all, "selection", studentGradeId, invoiceIds.join(",")] as const,
}

export const receiptPrintUrl = (transactionId: number): string => adminApi.receiptPrintUrl(transactionId)

export const useInvoiceSelection = (
	studentGradeId: number,
	invoiceIds: readonly number[],
): UseQueryResult<InvoiceSelectionResult> =>
	useQuery({
		queryKey: paymentKeys.selection(studentGradeId, invoiceIds),
		queryFn: () => adminApi.prepareTransaction({ studentGradeId, invoiceIds: [...invoiceIds] }),
		enabled: Number.isFinite(studentGradeId) && invoiceIds.length > 0,
		retry: false,
	})

export const useCreateTransaction = (): UseMutationResult<
	CreateTransactionResult,
	Error,
	CreateTransactionDto
> => useMutation({ mutationFn: (dto: CreateTransactionDto) => adminApi.createTransaction(dto) })

type CancelTransactionInput = { transactionId: number } & CancelTransactionDto

export const useCancelTransaction = (
	onCancelled: () => void,
): LegacySubmit<CancelTransactionInput, AdminMessageResult> => {
	const queryClient = useQueryClient()
	return useLegacySubmit({
		mutationFn: ({ transactionId, cancelNote }: CancelTransactionInput) =>
			adminApi.cancelTransaction(transactionId, { cancelNote }),
		afterMs: 0,
		onDone: () => {
			onCancelled()
			void queryClient.invalidateQueries({ queryKey: studentInvoiceKeys.all })
			void queryClient.invalidateQueries({ queryKey: studentTransactionKeys.all })
		},
	})
}

export const useUpdateTransactionNote = (
	transactionId: number,
): UseMutationResult<AdminMessageResult, Error, UpdateTransactionNoteDto> =>
	useMutation({
		mutationFn: (dto: UpdateTransactionNoteDto) => adminApi.updateTransactionNote(transactionId, dto),
	})

export const useDownloadReceipt = (
	transactionId: number,
	fallbackFileName = "Kuitansi.pdf",
): UseMutationResult<{ blob: Blob; fileName: string | null }, Error, void> =>
	useMutation({
		mutationFn: () => adminApi.downloadReceipt(transactionId),
		onSuccess: ({ blob, fileName }) => saveBlob(blob, fileName ?? fallbackFileName),
	})
