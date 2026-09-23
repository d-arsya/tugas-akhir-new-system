import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import type {
	InvoiceBillDetail,
	InvoiceBillQuery,
	InvoiceBillRow,
	InvoiceDetailPage,
	InvoiceTransactionRow,
	ServerTableResult,
	StudentInvoiceListQuery,
	StudentInvoiceListRow,
} from "@roja/types"

import { adminApi } from "@/lib/api"

// Queries behind Tagihan Santri's three read pages (legacy `StudentInvoiceController`
// @studentListServerSide, @edit, @listBillServerSide, @listTransaction, @listCancel, @detailBill).
export const studentInvoiceKeys = {
	all: ["admin-student-invoices"] as const,
	students: () => [...studentInvoiceKeys.all, "students"] as const,
	detail: (studentGradeId: number) => [...studentInvoiceKeys.all, "detail", studentGradeId] as const,
	bills: (studentGradeId: number) => [...studentInvoiceKeys.all, "bills", studentGradeId] as const,
	payments: (studentGradeId: number) => [...studentInvoiceKeys.all, "payments", studentGradeId] as const,
	cancelled: (studentGradeId: number) => [...studentInvoiceKeys.all, "cancelled", studentGradeId] as const,
	bill: (invoiceId: number) => [...studentInvoiceKeys.all, "bill", invoiceId] as const,
}

/** `useServerTable` fetchers — the hook owns the paging state and supplies the query. */
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

/**
 * Riwayat Pembayaran. Legacy builds this tab's DataTable only on `shown.bs.tab`, so the request
 * does not fire until the tab is opened — `enabled` reproduces that.
 */
export const useStudentPayments = (studentGradeId: number, enabled: boolean): UseQueryResult<InvoiceTransactionRow[]> =>
	useQuery({
		queryKey: studentInvoiceKeys.payments(studentGradeId),
		queryFn: () => adminApi.getStudentPaymentRows(studentGradeId),
		enabled,
	})

/** Dibatalkan. Same lazy-on-tab behaviour, except that `?cancel=1` opens it on load. */
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
