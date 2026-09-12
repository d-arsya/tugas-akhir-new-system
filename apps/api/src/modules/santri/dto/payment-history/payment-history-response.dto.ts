import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const PaymentHistoryInvoiceSchema = z.object({
	id: z.number(),
	name: z.string(),
	amount: z.number(),
	paidAmount: z.number(),
	remainingAmount: z.number(),
	status: z.string(),
	statusLabel: z.string(),
	paymentMethod: z.string().nullish(),
	dueDate: z.string().nullish(),
	reminder: z.string().nullish(),
	note: z.string().nullish(),
})

export class PaymentHistoryInvoiceDto extends createZodDto(PaymentHistoryInvoiceSchema) {}

export const PaymentHistorySummarySchema = z.object({
	totalBilled: z.number(),
	totalPaid: z.number(),
	remaining: z.number(),
	invoices: z.array(PaymentHistoryInvoiceSchema),
})

export class PaymentHistorySummaryDto extends createZodDto(PaymentHistorySummarySchema) {}

export const InvoiceTransactionSchema = z.object({
	id: z.number(),
	transactionCode: z.string(),
	paidAt: z.string().nullish(),
	amount: z.number(),
	invoicePayAmount: z.number(),
	desc: z.string().nullish(),
	description: z.string().nullish(),
	note: z.string().nullish(),
	status: z.string(),
})

export const PaymentHistoryInvoiceDetailSchema = z.object({
	invoice: z.object({
		id: z.number(),
		name: z.string(),
		amount: z.number(),
		status: z.string(),
		paymentMethod: z.string().nullish(),
		dueDate: z.string().nullish(),
		reminder: z.string().nullish(),
		note: z.string().nullish(),
	}),
	student: z.object({
		id: z.number(),
		nis: z.string().nullish(),
		fullName: z.string(),
	}),
	studentName: z.string(),
	studentNis: z.string(),
	transactions: z.array(InvoiceTransactionSchema),
	totalPaid: z.number(),
	costRemain: z.number(),
})

export class PaymentHistoryInvoiceDetailDto extends createZodDto(PaymentHistoryInvoiceDetailSchema) {}
