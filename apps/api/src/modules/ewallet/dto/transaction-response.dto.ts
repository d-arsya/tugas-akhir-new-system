import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const EwalletTransactionItemDetailSchema = z.object({
	id: z.number(),
	description: z.string(),
	price: z.number(),
})

export const TransactionDetailResponseSchema = z.object({
	id: z.number(),
	code: z.string().nullable(),
	name: z.string().nullable(),
	type: z.string().nullable(),
	typeLabel: z.string(),
	amount: z.string().nullable(),
	status: z.string().nullable(),
	statusLabel: z.string(),
	paymentMethod: z.string().nullable(),
	paymentAccount: z.string().nullable(),
	paymentOnBehalfOf: z.string().nullable(),
	paymentAttachment: z.string().nullable(),
	paymentDate: z.string().nullable(),
	transferNewsNumber: z.number().nullable(),
	paymentNote: z.string().nullable(),
	invalidNote: z.string().nullable(),
	createdAt: z.string(),
	items: z.array(EwalletTransactionItemDetailSchema).optional(),
})

export class TransactionDetailResponseDto extends createZodDto(TransactionDetailResponseSchema) {}

export const TopUpBankInfoResponseSchema = z.object({
	bankName: z.string(),
	accountNumber: z.string(),
	accountName: z.string(),
	minAmount: z.number(),
	note: z.string(),
})

export class TopUpBankInfoResponseDto extends createZodDto(TopUpBankInfoResponseSchema) {}

export const TopUpCreatedResponseSchema = z.object({
	transactionId: z.number(),
	code: z.string(),
	amount: z.number(),
	transferNewsNumber: z.number(),
	paymentAccount: z.string(),
	paymentOnBehalfOf: z.string(),
	message: z.string(),
})

export class TopUpCreatedResponseDto extends createZodDto(TopUpCreatedResponseSchema) {}
