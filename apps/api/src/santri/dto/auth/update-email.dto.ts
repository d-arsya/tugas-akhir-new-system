import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const SantriUpdateEmailSchema = z.object({
	email: z.string().email("Format email tidak valid"),
})

export class SantriUpdateEmailDto extends createZodDto(SantriUpdateEmailSchema) {}
