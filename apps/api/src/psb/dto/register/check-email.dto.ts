import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const CheckEmailSchema = z.object({
	email: z.string().email("Format email tidak valid"),
	levelId: z.coerce.number().int().positive("Jenjang pendidikan wajib dipilih"),
})

export class CheckEmailDto extends createZodDto(CheckEmailSchema) {}
