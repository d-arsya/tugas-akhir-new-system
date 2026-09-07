import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const PsbLoginSchema = z.object({
	email: z.string().email("Format email tidak valid"),
	password: z.string().min(1, "Password wajib diisi"),
})

export class PsbLoginDto extends createZodDto(PsbLoginSchema) {}
