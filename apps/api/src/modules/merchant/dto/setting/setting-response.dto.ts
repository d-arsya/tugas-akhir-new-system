import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const MerchantSettingOverviewSchema = z.object({
	merchantName: z.string().nullable(),
	phone: z.string().nullable(),
	address: z.string().nullable(),
	email: z.string().nullable(),
	photo: z.string().nullable(),
	enabled2fa: z.boolean(),
	emailVerifiedAt: z.string().nullable(),
})

export class MerchantSettingOverviewDto extends createZodDto(MerchantSettingOverviewSchema) {}

export const UpdateProfileResponseDataSchema = z.object({
	merchantName: z.string().nullable(),
	phone: z.string().nullable(),
	address: z.string().nullable(),
	photo: z.string().nullable(),
})

export const UpdateProfileResponseSchema = z.object({
	message: z.string(),
	data: UpdateProfileResponseDataSchema,
})

export class UpdateProfileResponseDto extends createZodDto(UpdateProfileResponseSchema) {}

export const Toggle2faResponseSchema = z.object({
	message: z.string(),
	enabled2fa: z.boolean(),
})

export class Toggle2faResponseDto extends createZodDto(Toggle2faResponseSchema) {}
