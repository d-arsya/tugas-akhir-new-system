import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const EwalletStatusSchema = z.object({
	hasEwallet: z.boolean(),
	isActive: z.boolean(),
})

export class EwalletStatusDto extends createZodDto(EwalletStatusSchema) {}

export const EwalletTransactionSummarySchema = z.object({
	id: z.number(),
	code: z.string().nullish(),
	name: z.string().nullish(),
	type: z.enum(["income", "expense", "purchase"]).nullish(),
	amount: z.string().nullish(),
	status: z.string().nullish(),
	paymentMethod: z.string().nullish(),
	paymentDate: z.string().nullish(),
	createdAt: z.string(),
})

export class EwalletTransactionSummaryDto extends createZodDto(EwalletTransactionSummarySchema) {}

export const EwalletDashboardSchema = z.object({
	totalBalance: z.number(),
	ewallet: z.object({
		id: z.number(),
		uniqueId: z.string().nullish(),
		studentName: z.string().nullish(),
		studentGradeLevel: z.string().nullish(),
		studentGradeNumber: z.string().nullish(),
		isActive: z.boolean().nullish(),
	}),
	transactions: z.array(EwalletTransactionSummarySchema),
})

export class EwalletDashboardDto extends createZodDto(EwalletDashboardSchema) {}

export const EwalletInactiveSchema = z.object({
	isActive: z.boolean(),
	message: z.string(),
})

export class EwalletInactiveDto extends createZodDto(EwalletInactiveSchema) {}
