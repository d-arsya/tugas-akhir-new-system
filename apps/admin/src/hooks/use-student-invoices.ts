import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminMessageResult,
	InvoiceBillDetail,
	InvoiceBillQuery,
	InvoiceBillRow,
	InvoiceDetailPage,
	InvoiceTransactionRow,
	ServerTableResult,
	StudentInvoiceListQuery,
	StudentInvoiceListRow,
	UpdateInvoiceNoteDto,
} from "@roja/types"

import { adminApi } from "@/lib/api"
import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"

export const studentInvoiceKeys = {
	all: ["admin-student-invoices"] as const,
	students: () => [...studentInvoiceKeys.all, "students"] as const,
	detail: (studentGradeId: number) => [...studentInvoiceKeys.all, "detail", studentGradeId] as const,
	bills: (studentGradeId: number) => [...studentInvoiceKeys.all, "bills", studentGradeId] as const,
	payments: (studentGradeId: number) => [...studentInvoiceKeys.all, "payments", studentGradeId] as const,
	cancelled: (studentGradeId: number) => [...studentInvoiceKeys.all, "cancelled", studentGradeId] as const,
	bill: (invoiceId: number) => [...studentInvoiceKeys.all, "bill", invoiceId] as const,
}

export const fetchStudentInvoiceRows = (
	query: StudentInvoiceListQuery,
): Promise<ServerTableResult<StudentInvoiceListRow>> => adminApi.getStudentInvoiceRows(query)

export const fetchStudentBillRows =
	(studentGradeId: number) =>
	(query: InvoiceBillQuery): Promise<ServerTableResult<InvoiceBillRow>> =>
		adminApi.getStudentBillRows(studentGradeId, query)

export const useStudentInvoiceDetail = (studentGradeId: number): UseQueryResult<InvoiceDetailPage> =>
	useQuery({
		queryKey: studentInvoiceKeys.detail(studentGradeId),
		queryFn: () => adminApi.getStudentInvoiceDetail(studentGradeId),
	})

export const useStudentPayments = (studentGradeId: number, enabled: boolean): UseQueryResult<InvoiceTransactionRow[]> =>
	useQuery({
		queryKey: studentInvoiceKeys.payments(studentGradeId),
		queryFn: () => adminApi.getStudentPaymentRows(studentGradeId),
		enabled,
	})

export const useStudentCancelled = (
	studentGradeId: number,
	enabled: boolean,
): UseQueryResult<InvoiceTransactionRow[]> =>
	useQuery({
		queryKey: studentInvoiceKeys.cancelled(studentGradeId),
		queryFn: () => adminApi.getStudentCancelledRows(studentGradeId),
		enabled,
	})

export const useInvoiceBill = (invoiceId: number): UseQueryResult<InvoiceBillDetail> =>
	useQuery({
		queryKey: studentInvoiceKeys.bill(invoiceId),
		queryFn: () => adminApi.getInvoiceBill(invoiceId),
	})

export const useUpdateInvoiceNote = (invoiceId: number): LegacySubmit<UpdateInvoiceNoteDto, AdminMessageResult> => {
	const queryClient = useQueryClient()
	return useLegacySubmit({
		mutationFn: (body: UpdateInvoiceNoteDto) => adminApi.updateInvoiceNote(invoiceId, body),
		onDone: () => {
			void queryClient.invalidateQueries({ queryKey: studentInvoiceKeys.bill(invoiceId) })
		},
	})
}
