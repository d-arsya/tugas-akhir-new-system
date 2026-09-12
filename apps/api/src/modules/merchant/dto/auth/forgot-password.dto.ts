import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const MerchantForgotPasswordSchema = z.object({
	uniqueNumber: z.string().min(1, "Nomor Merchant wajib diisi"),
})

export class MerchantForgotPasswordDto extends createZodDto(MerchantForgotPasswordSchema) {}
