import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const EwalletTransactionItemDetailSchema = z.object({
	id: z.number(),
	description: z.string(),
	price: z.number(),
})

export const TransactionDetailResponseSchema = z.object({
	id: z.number(),
	code: z.string().nullish(),
	name: z.string().nullish(),
	type: z.string().nullish(),
	typeLabel: z.string(),
	amount: z.string().nullish(),
	status: z.string().nullish(),
	statusLabel: z.string(),
	paymentMethod: z.string().nullish(),
	paymentAccount: z.string().nullish(),
	paymentOnBehalfOf: z.string().nullish(),
	paymentAttachment: z.string().nullish(),
	paymentDate: z.string().nullish(),
	transferNewsNumber: z.number().nullish(),
	paymentNote: z.string().nullish(),
	invalidNote: z.string().nullish(),
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
