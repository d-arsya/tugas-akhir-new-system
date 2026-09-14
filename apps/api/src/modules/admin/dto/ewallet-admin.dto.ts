import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const TopUpEwalletSchema = z.object({
	amount: z.number().positive("Nominal topup harus lebih dari 0"),
	note: z.string().optional(),
})

export class TopUpEwalletDto extends createZodDto(TopUpEwalletSchema) {}

export const ValidatePinSchema = z.object({
	pin: z.string().min(4, "PIN minimal 4 karakter"),
})

export class ValidatePinDto extends createZodDto(ValidatePinSchema) {}

export const WithdrawEwalletSchema = z.object({
	amount: z.number().positive("Nominal withdraw harus lebih dari 0"),
	note: z.string().optional(),
})

export class WithdrawEwalletDto extends createZodDto(WithdrawEwalletSchema) {}

export const ResetPinSchema = z.object({
	newPin: z.string().min(4, "PIN minimal 4 karakter"),
})

export class ResetPinDto extends createZodDto(ResetPinSchema) {}

export const UpdateEwalletSettingSchema = z.object({
	isActive: z.boolean().optional(),
	uniqueId: z.string().optional(),
})

export class UpdateEwalletSettingDto extends createZodDto(UpdateEwalletSettingSchema) {}

export const UpdateEwalletTxStatusSchema = z.object({
	status: z.enum(["valid", "invalid", "process", "waiting"]),
	invalidNote: z.string().optional(),
})

export class UpdateEwalletTxStatusDto extends createZodDto(UpdateEwalletTxStatusSchema) {}

export const EwalletResponseSchema = z.object({
	id: z.number(),
	ownerId: z.number().nullable().optional(),
	ownerType: z.string().nullable().optional(),
	balance: z.number(),
	isActive: z.boolean().optional(),
	isBlocked: z.boolean().optional(),
})

export class EwalletResponseDto extends createZodDto(EwalletResponseSchema) {}
