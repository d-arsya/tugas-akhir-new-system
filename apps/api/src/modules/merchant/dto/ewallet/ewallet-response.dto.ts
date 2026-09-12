import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { EwalletTransactionSummarySchema } from "@modules/ewallet/dto/ewallet-response.dto"

export const MerchantEwalletStatusSchema = z.object({
	hasEwallet: z.boolean(),
	isActive: z.boolean(),
})

export class MerchantEwalletStatusDto extends createZodDto(MerchantEwalletStatusSchema) {}

export const MerchantEwalletDashboardSchema = z.object({
	totalBalance: z.number(),
	ewallet: z.object({
		id: z.number(),
		uniqueId: z.string().nullish(),
		merchantName: z.string().nullish(),
		isActive: z.boolean().nullish(),
	}),
	transactions: z.array(EwalletTransactionSummarySchema),
})

export class MerchantEwalletDashboardDto extends createZodDto(MerchantEwalletDashboardSchema) {}

export const MerchantEwalletInactiveSchema = z.object({
	isActive: z.boolean(),
	message: z.string(),
})

export class MerchantEwalletInactiveDto extends createZodDto(MerchantEwalletInactiveSchema) {}

export const MerchantBankInfoResponseSchema = z.object({
	bankName: z.string(),
	accountNumber: z.string(),
	accountName: z.string(),
	minAmount: z.number(),
})

export class MerchantBankInfoResponseDto extends createZodDto(MerchantBankInfoResponseSchema) {}

export const MerchantCashInfoResponseSchema = z.object({
	title: z.string(),
	description: z.string(),
})

export class MerchantCashInfoResponseDto extends createZodDto(MerchantCashInfoResponseSchema) {}

export const MerchantWithdrawInfoResponseSchema = z.object({
	title: z.string(),
	description: z.string(),
})

export class MerchantWithdrawInfoResponseDto extends createZodDto(MerchantWithdrawInfoResponseSchema) {}
