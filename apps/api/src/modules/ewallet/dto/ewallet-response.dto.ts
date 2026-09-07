import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const EwalletStatusSchema = z.object({
	hasEwallet: z.boolean(),
	isActive: z.boolean(),
})

export class EwalletStatusDto extends createZodDto(EwalletStatusSchema) {}

export const EwalletTransactionSummarySchema = z.object({
	id: z.number(),
	code: z.string().nullable(),
	name: z.string().nullable(),
	type: z.enum(["income", "expense", "purchase"]).nullable(),
	amount: z.string().nullable(),
	status: z.string().nullable(),
	paymentMethod: z.string().nullable(),
	paymentDate: z.string().nullable(),
	createdAt: z.string(),
})

export class EwalletTransactionSummaryDto extends createZodDto(EwalletTransactionSummarySchema) {}

export const EwalletDashboardSchema = z.object({
	totalBalance: z.number(),
	ewallet: z.object({
		id: z.number(),
		uniqueId: z.string().nullable(),
		studentName: z.string().nullable(),
		studentGradeLevel: z.string().nullable(),
		studentGradeNumber: z.string().nullable(),
		isActive: z.boolean().nullable(),
	}),
	transactions: z.array(EwalletTransactionSummarySchema),
})

export class EwalletDashboardDto extends createZodDto(EwalletDashboardSchema) {}

export const EwalletInactiveSchema = z.object({
	isActive: z.boolean(),
	message: z.string(),
})

export class EwalletInactiveDto extends createZodDto(EwalletInactiveSchema) {}
