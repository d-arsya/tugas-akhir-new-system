import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const SantriForgotPasswordSchema = z.object({
	email: z.string().email("Format email tidak valid"),
})

export class SantriForgotPasswordDto extends createZodDto(SantriForgotPasswordSchema) {}
