import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const SantriLoginSchema = z.object({
	nis: z.string().min(1, "NIS wajib diisi"),
	password: z.string().min(1, "Password wajib diisi"),
})

export class SantriLoginDto extends createZodDto(SantriLoginSchema) {}
