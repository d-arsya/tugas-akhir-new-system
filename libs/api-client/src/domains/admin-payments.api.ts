import type { AxiosInstance } from "axios"

import type {
	CancelTransactionDto,
	CreateTransactionDto,
	CreateTransactionResult,
	InvoiceBillDetail,
	InvoiceBillQuery,
	InvoiceBillRow,
	InvoiceDetailPage,
	InvoiceSelectionDto,
	InvoiceSelectionResult,
	InvoiceTransactionRow,
	ServerTableResult,
	StudentInvoiceListQuery,
	StudentInvoiceListRow,
	StudentTransactionDetail,
	StudentTransactionListQuery,
	StudentTransactionListRow,
	UpdateInvoiceNoteDto,
	UpdateTransactionNoteDto,
} from "@roja/types"

import type { AdminMessageResult } from "@roja/types"

/**
 * Endpoints behind the admin "Pembayaran Santri" menu (Tagihan Santri and Riwayat
 * Transaksi), ported 1:1 from the legacy Laravel pages. Every route is gated
 * Superadmin | Bendahara — narrower than the Data Master menu.
 */
export interface AdminPaymentsApi {
	// Tagihan Santri — student picker (serverSide)
	getStudentInvoiceRows(params: StudentInvoiceListQuery): Promise<ServerTableResult<StudentInvoiceListRow>>

	// Tagihan Santri — one student
	getStudentInvoiceDetail(studentGradeId: number): Promise<InvoiceDetailPage>
	getStudentBillRows(studentGradeId: number, params: InvoiceBillQuery): Promise<ServerTableResult<InvoiceBillRow>>
	getStudentPaymentRows(studentGradeId: number): Promise<InvoiceTransactionRow[]>
	getStudentCancelledRows(studentGradeId: number): Promise<InvoiceTransactionRow[]>

	// One invoice
	getInvoiceBill(invoiceId: number): Promise<InvoiceBillDetail>
	updateInvoiceNote(invoiceId: number, data: UpdateInvoiceNoteDto): Promise<AdminMessageResult>

	// Recording a payment
	prepareTransaction(data: InvoiceSelectionDto): Promise<InvoiceSelectionResult>
	createTransaction(data: CreateTransactionDto): Promise<CreateTransactionResult>
	cancelTransaction(transactionId: number, data: CancelTransactionDto): Promise<AdminMessageResult>
	updateTransactionNote(transactionId: number, data: UpdateTransactionNoteDto): Promise<AdminMessageResult>
	downloadReceipt(transactionId: number): Promise<{ blob: Blob; fileName: string | null }>
	/** Legacy `studentInvoice.printTransaction` — an A5-landscape HTML page opened with target="_blank". */
	receiptPrintUrl(transactionId: number): string

	// Riwayat Transaksi (serverSide)
	getTransactionRows(params: StudentTransactionListQuery): Promise<ServerTableResult<StudentTransactionListRow>>
	getTransactionDetail(transactionId: number): Promise<StudentTransactionDetail>
}

const unwrap = <T>(promise: Promise<{ data: unknown }>): Promise<T> =>
	promise.then((response) => {
		const body = response.data
		if (body && typeof body === "object" && "data" in body) {
			return (body as { data: T }).data
		}
		return body as T
	})

// RFC 6266: prefer filename* (UTF-8), fall back to the quoted filename
const fileNameFromDisposition = (header: string | undefined): string | null => {
	if (!header) return null
	const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)?.[1]
	if (encoded) return decodeURIComponent(encoded)
	return /filename="([^"]+)"/i.exec(header)?.[1] ?? null
}

export const createAdminPaymentsApi = (client: AxiosInstance): AdminPaymentsApi => ({
	getStudentInvoiceRows: (params) => unwrap(client.get("/admin/student-invoices", { params })),

	getStudentInvoiceDetail: (studentGradeId) =>
		unwrap(client.get(`/admin/student-invoices/${studentGradeId}`)),
	getStudentBillRows: (studentGradeId, params) =>
		unwrap(client.get(`/admin/student-invoices/${studentGradeId}/bills`, { params })),
	getStudentPaymentRows: (studentGradeId) =>
		unwrap(client.get(`/admin/student-invoices/${studentGradeId}/payments`)),
	getStudentCancelledRows: (studentGradeId) =>
		unwrap(client.get(`/admin/student-invoices/${studentGradeId}/cancelled`)),

	getInvoiceBill: (invoiceId) => unwrap(client.get(`/admin/student-invoices/bills/${invoiceId}`)),
	updateInvoiceNote: (invoiceId, data) =>
		unwrap(client.patch(`/admin/student-invoices/bills/${invoiceId}/note`, data)),

	prepareTransaction: (data) => unwrap(client.post("/admin/student-invoices/prepare-transaction", data)),
	createTransaction: (data) => unwrap(client.post("/admin/student-invoices/transactions", data)),
	cancelTransaction: (transactionId, data) =>
		unwrap(client.patch(`/admin/student-invoices/transactions/${transactionId}/cancel`, data)),
	updateTransactionNote: (transactionId, data) =>
		unwrap(client.patch(`/admin/student-invoices/transactions/${transactionId}/note`, data)),
	downloadReceipt: (transactionId) =>
		client
			.get<Blob>(`/admin/student-invoices/transactions/${transactionId}/receipt`, {
				responseType: "blob",
			})
			.then((response) => ({
				blob: response.data,
				fileName: fileNameFromDisposition(response.headers["content-disposition"] as string | undefined),
			})),

	receiptPrintUrl: (transactionId) =>
		`${client.defaults.baseURL ?? ""}/admin/student-invoices/transactions/${transactionId}/print`,

	getTransactionRows: (params) => unwrap(client.get("/admin/student-transactions", { params })),
	getTransactionDetail: (transactionId) =>
		unwrap(client.get(`/admin/student-transactions/${transactionId}`)),
})
