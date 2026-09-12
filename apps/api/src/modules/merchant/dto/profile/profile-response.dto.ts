import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const MerchantProfileResponseSchema = z.object({
	id: z.number(),
	name: z.string().nullish(),
	merchantName: z.string().nullish(),
	phone: z.string().nullish(),
	address: z.string().nullish(),
	email: z.string().nullish(),
	uniqueNumber: z.string().nullish(),
	photo: z.string().nullish(),
	enabled2fa: z.boolean(),
	emailVerifiedAt: z.string().nullish(),
})

export class MerchantProfileResponseDto extends createZodDto(MerchantProfileResponseSchema) {}
