import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const MerchantSettingOverviewSchema = z.object({
	merchantName: z.string().nullish(),
	phone: z.string().nullish(),
	address: z.string().nullish(),
	email: z.string().nullish(),
	photo: z.string().nullish(),
	enabled2fa: z.boolean(),
	emailVerifiedAt: z.string().nullish(),
})

export class MerchantSettingOverviewDto extends createZodDto(MerchantSettingOverviewSchema) {}

export const UpdateProfileResponseDataSchema = z.object({
	merchantName: z.string().nullish(),
	phone: z.string().nullish(),
	address: z.string().nullish(),
	photo: z.string().nullish(),
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
