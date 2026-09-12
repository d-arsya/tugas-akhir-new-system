import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const MerchantProfileResponseSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	merchantName: z.string().nullable(),
	phone: z.string().nullable(),
	address: z.string().nullable(),
	email: z.string().nullable(),
	uniqueNumber: z.string().nullable(),
	photo: z.string().nullable(),
	enabled2fa: z.boolean(),
	emailVerifiedAt: z.string().nullable(),
})

export class MerchantProfileResponseDto extends createZodDto(MerchantProfileResponseSchema) {}
