import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const SantriTwoFactorSchema = z.object({
	code: z.string().length(6, "Kode 2FA harus 6 digit"),
})

export class SantriTwoFactorDto extends createZodDto(SantriTwoFactorSchema) {}
