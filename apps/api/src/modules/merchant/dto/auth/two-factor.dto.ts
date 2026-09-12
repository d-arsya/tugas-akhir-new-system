import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const MerchantTwoFactorSchema = z.object({
	code: z.string().length(6, "Kode 2FA harus 6 digit"),
})

export class MerchantTwoFactorDto extends createZodDto(MerchantTwoFactorSchema) {}
