import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const MerchantLoginSchema = z.object({
	uniqueNumber: z.string().min(1, "Nomor Merchant wajib diisi"),
	password: z.string().min(1, "Password wajib diisi"),
})

export class MerchantLoginDto extends createZodDto(MerchantLoginSchema) {}
