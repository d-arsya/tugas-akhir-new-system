import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const PsbTwoFactorSchema = z.object({
	code: z.string().length(6, "Kode verifikasi 2FA harus 6 digit"),
	email: z.string().email("Format email tidak valid"),
})

export class PsbTwoFactorDto extends createZodDto(PsbTwoFactorSchema) {}

export const PsbResendTwoFactorSchema = z.object({
	email: z.string().email("Format email tidak valid"),
})

export class PsbResendTwoFactorDto extends createZodDto(PsbResendTwoFactorSchema) {}
