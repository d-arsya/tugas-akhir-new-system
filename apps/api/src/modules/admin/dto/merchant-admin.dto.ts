import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const CreateMerchantSchema = z.object({
	name: z.string().min(1, "Nama merchant / toko wajib diisi"),
	email: z.string().email("Email login portal merchant tidak valid"),
	picName: z.string().min(1, "Nama PIC wajib diisi"),
	phone: z.string().optional(),
	address: z.string().optional(),
})

export class CreateMerchantDto extends createZodDto(CreateMerchantSchema) {}

export const UpdateMerchantSchema = z.object({
	name: z.string().optional(),
	email: z.string().email().optional(),
	picName: z.string().optional(),
	phone: z.string().optional(),
	address: z.string().optional(),
})

export class UpdateMerchantDto extends createZodDto(UpdateMerchantSchema.partial()) {}

export const ToggleBlockMerchantSchema = z.object({
	blocked: z.boolean(),
})

export class ToggleBlockMerchantDto extends createZodDto(ToggleBlockMerchantSchema) {}

export const MerchantResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
	email: z.string(),
	uniqueNumber: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
	isBlocked: z.boolean().optional(),
})

export class MerchantResponseDto extends createZodDto(MerchantResponseSchema) {}
