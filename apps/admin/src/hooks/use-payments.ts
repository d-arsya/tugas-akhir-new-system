import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminMessageResult,
	CancelTransactionDto,
	CreateTransactionDto,
	CreateTransactionResult,
	InvoiceSelectionDto,
	InvoiceSelectionResult,
	UpdateTransactionNoteDto,
} from "@roja/types"

import { saveBlob } from "@/lib/download"
import { adminApi } from "@/lib/api"

// Legacy `StudentInvoiceController` write half: @getDataInvoice, @storeTransaction,
// @cancelTransaction, @updateTransaction and @downloadTransaction.

export const paymentKeys = {
	all: ["admin-payments"] as const,
	selection: (studentGradeId: number, invoiceIds: readonly number[]) =>
		[...paymentKeys.all, "selection", studentGradeId, invoiceIds.join(",")] as const,
}

/**
 * The selection as a query, for the Buat Pembayaran page.
 *
 * Legacy read this from the `idInvoice` session key, which was global and not bound to the
 * santri; the port passes the ids in the URL and re-validates them server-side, so reloading
 * the page, opening it in a second tab, or editing the query string all land on the same
 * checked answer instead of on whatever the last tab happened to store.
 */
export const useInvoiceSelection = (
	studentGradeId: number,
	invoiceIds: readonly number[],
): UseQueryResult<InvoiceSelectionResult> =>
	useQuery({
		queryKey: paymentKeys.selection(studentGradeId, invoiceIds),
		queryFn: () => adminApi.prepareTransaction({ studentGradeId, invoiceIds: [...invoiceIds] }),
		enabled: Number.isFinite(studentGradeId) && invoiceIds.length > 0,
		// A rejected selection is a business answer, not a blip — retrying just repeats the 422
		retry: false,
	})

/**
 * The same endpoint as a mutation, for the Tagihan tab's "Buat Pembayaran" button.
 *
 * Legacy posted `getDataInvoice` first and only followed the redirect once it answered, which is
 * what surfaces the arrears message before the form opens. Keeping that order means a mixed
 * selection never gets as far as a payment screen.
 */
export const usePrepareTransaction = (): UseMutationResult<
	InvoiceSelectionResult,
	Error,
	InvoiceSelectionDto
> => useMutation({ mutationFn: (dto: InvoiceSelectionDto) => adminApi.prepareTransaction(dto) })

export const useCreateTransaction = (): UseMutationResult<
	CreateTransactionResult,
	Error,
	CreateTransactionDto
> => useMutation({ mutationFn: (dto: CreateTransactionDto) => adminApi.createTransaction(dto) })

/**
 * `@cancelTransaction`. Used from the Riwayat Pembayaran tab on the Tagihan detail page, which
 * belongs to the invoice workstream — the mutation and its modal live here because cancelling a
 * payment is a payment concern.
 */
export const useCancelTransaction = (
	transactionId: number,
): UseMutationResult<AdminMessageResult, Error, CancelTransactionDto> =>
	useMutation({ mutationFn: (dto: CancelTransactionDto) => adminApi.cancelTransaction(transactionId, dto) })

export const useUpdateTransactionNote = (
	transactionId: number,
): UseMutationResult<AdminMessageResult, Error, UpdateTransactionNoteDto> =>
	useMutation({
		mutationFn: (dto: UpdateTransactionNoteDto) => adminApi.updateTransactionNote(transactionId, dto),
	})

/**
 * `@downloadTransaction`. The endpoint needs the bearer token, so the file is fetched through the
 * api client and saved from the blob rather than linked to directly.
 */
export const useDownloadReceipt = (
	transactionId: number,
): UseMutationResult<{ blob: Blob; fileName: string | null }, Error, void> =>
	useMutation({
		mutationFn: () => adminApi.downloadReceipt(transactionId),
		onSuccess: ({ blob, fileName }) => saveBlob(blob, fileName ?? "Kuitansi.pdf"),
	})
