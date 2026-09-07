import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const PsbForgotPasswordSchema = z.object({
	email: z.string().email("Format email tidak valid"),
})

export class PsbForgotPasswordDto extends createZodDto(PsbForgotPasswordSchema) {}
