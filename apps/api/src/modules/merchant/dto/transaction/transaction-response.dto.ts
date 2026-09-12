import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const CreateTransactionResponseSchema = z.object({
	message: z.string(),
	transactionId: z.number(),
	code: z.string(),
	totalAmount: z.number(),
})

export class CreateTransactionResponseDto extends createZodDto(CreateTransactionResponseSchema) {}

export const QrPageDataResponseSchema = z.object({
	transactionId: z.number(),
	code: z.string(),
	amount: z.number(),
	status: z.string().nullish(),
	merchantUniqueNumber: z.string().nullish(),
})

export class QrPageDataResponseDto extends createZodDto(QrPageDataResponseSchema) {}

export const ValidateScanResponseSchema = z.object({
	transactionId: z.number(),
	message: z.string(),
})

export class ValidateScanResponseDto extends createZodDto(ValidateScanResponseSchema) {}

export const CheckoutItemSchema = z.object({
	id: z.number(),
	description: z.string().nullish(),
	price: z.number().nullish(),
})

export const CheckoutDataResponseSchema = z.object({
	transactionId: z.number(),
	code: z.string(),
	status: z.string().nullish(),
	paymentMethod: z.string().nullish(),
	buyerName: z.string(),
	totalPrice: z.number(),
	items: z.array(CheckoutItemSchema),
})

export class CheckoutDataResponseDto extends createZodDto(CheckoutDataResponseSchema) {}

export const UpdateTransactionItemResponseSchema = z.object({
	message: z.string(),
	currentTotal: z.number(),
})

export class UpdateTransactionItemResponseDto extends createZodDto(UpdateTransactionItemResponseSchema) {}

export const ValidatePinResponseSchema = z.object({
	success: z.boolean().optional(),
	message: z.string(),
	isBlocked: z.boolean().optional(),
	isWrongPin: z.boolean().optional(),
	isBalanceInsufficient: z.boolean().optional(),
	attempts: z.number().optional(),
	remainingAttempts: z.number().optional(),
})

export class ValidatePinResponseDto extends createZodDto(ValidatePinResponseSchema) {}

export const MerchantTransactionListItemSchema = z.object({
	id: z.number(),
	code: z.string().nullish(),
	name: z.string().nullish(),
	type: z.string().nullish(),
	typeLabel: z.string(),
	amount: z.string().nullish(),
	status: z.string().nullish(),
	statusLabel: z.string(),
	paymentMethod: z.string().nullish(),
	paymentDate: z.string().nullish(),
	createdAt: z.string(),
})

export class MerchantTransactionListItemDto extends createZodDto(MerchantTransactionListItemSchema) {}
