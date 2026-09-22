import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const CreateAccountancySchema = z.object({
	name: z.string().min(1, "Nama akun wajib diisi"),
	isParent: z.boolean().optional().default(false),
	parentId: z.string().optional().nullable(),
	group: z.enum(["income", "expense"]).optional().nullable(),
	isStudentCost: z.boolean().optional().default(false),
	note: z.string().optional().nullable(),
})

export class CreateAccountancyDto extends createZodDto(CreateAccountancySchema) {}
export class UpdateAccountancyDto extends createZodDto(CreateAccountancySchema.partial()) {}

export const DelegateAccountancyChildrenSchema = z.object({
	newParentId: z.string(),
})

export class DelegateAccountancyChildrenDto extends createZodDto(DelegateAccountancyChildrenSchema) {}

export const CreateCostTermSchema = z.object({
	accountancyId: z.number().int(),
	type: z.enum(["maximum", "option"]).optional().default("maximum"),
	period: z.enum(["once", "monthly"]).optional().default("once"),
	monthOf: z.number().int().optional().nullable(),
	dayOf: z.number().int().optional().nullable(),
	timeSpan: z.number().int().optional().nullable(),
	reminder: z.number().int().optional().nullable(),
	amounts: z.array(z.number()).min(1, "Minimal 1 nominal biaya"),
})

export class CreateCostTermDto extends createZodDto(CreateCostTermSchema) {}
export class UpdateCostTermDto extends createZodDto(CreateCostTermSchema.partial()) {}

export const BulkApplyCostTermSchema = z.object({
	costTermIds: z.array(z.number().int()),
})

export class BulkApplyCostTermDto extends createZodDto(BulkApplyCostTermSchema) {}

export const ValidateSelectionSchema = z.object({
	invoiceIds: z.array(z.number().int()),
})

export class ValidateSelectionDto extends createZodDto(ValidateSelectionSchema) {}

export const CreatePaymentTransactionSchema = z.object({
	invoiceIds: z.array(z.number().int()),
	paidAmount: z.number().positive("Jumlah bayar harus lebih dari 0"),
	paymentMethod: z.string().optional().default("tunai"),
	paidAt: z.string().optional(),
	note: z.string().optional(),
})

export class CreatePaymentTransactionDto extends createZodDto(CreatePaymentTransactionSchema) {}

export const CancelTransactionSchema = z.object({
	cancelNote: z.string().min(1, "Catatan pembatalan wajib diisi"),
})

export class CancelTransactionDto extends createZodDto(CancelTransactionSchema) {}

export const AccountancyResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
	isParent: z.boolean(),
	parentId: z.string().nullable().optional(),
	group: z.string().nullable().optional(),
	isStudentCost: z.boolean(),
	note: z.string().nullable().optional(),
})

export class AccountancyResponseDto extends createZodDto(AccountancyResponseSchema) {}

export const CostTermResponseSchema = z.object({
	id: z.number(),
	accountancyId: z.number(),
	academicYearId: z.number(),
	grade: z.string(),
	type: z.string(),
	period: z.string(),
	applied: z.boolean(),
})

export class CostTermResponseDto extends createZodDto(CostTermResponseSchema) {}

export const BillingInvoiceResponseSchema = z.object({
	id: z.number(),
	studentGradeId: z.number(),
	accountancyId: z.number(),
	amount: z.number(),
	paidAmount: z.number(),
	remainingAmount: z.number(),
	status: z.string(),
	monthOf: z.number().nullable().optional(),
	dueDate: z.string().nullable().optional(),
})

export class BillingInvoiceResponseDto extends createZodDto(BillingInvoiceResponseSchema) {}

export const BillingTransactionResponseSchema = z.object({
	id: z.number(),
	studentGradeId: z.number(),
	paidAmount: z.number(),
	paymentMethod: z.string(),
	status: z.string(),
	paidAt: z.string().nullable().optional(),
	note: z.string().nullable().optional(),
})

export class BillingTransactionResponseDto extends createZodDto(BillingTransactionResponseSchema) {}
