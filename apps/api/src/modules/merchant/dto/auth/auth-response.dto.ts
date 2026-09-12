import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const MerchantUserPayloadSchema = z.object({
	id: z.number(),
	uniqueNumber: z.string(),
	email: z.string().nullish(),
	name: z.string().nullish(),
	merchantName: z.string().nullish(),
})

export class MerchantUserPayloadDto extends createZodDto(MerchantUserPayloadSchema) {}

export const MerchantAuthResultSchema = z.object({
	requires2fa: z.boolean(),
	merchantId: z.number().optional(),
	email: z.string().nullish(),
	accessToken: z.string().optional(),
	refreshToken: z.string().optional(),
	user: MerchantUserPayloadSchema.optional(),
})

export class MerchantAuthResultDto extends createZodDto(MerchantAuthResultSchema) {}

export const MerchantMessageResponseSchema = z.object({
	message: z.string(),
})

export class MerchantMessageResponseDto extends createZodDto(MerchantMessageResponseSchema) {}

export const MerchantRefreshResultSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
})

export class MerchantRefreshResultDto extends createZodDto(MerchantRefreshResultSchema) {}
