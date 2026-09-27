import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const GoogleLoginSchema = z.object({
	credential: z.string().min(1, "Kredensial Google wajib diisi"),
})

export class GoogleLoginDto extends createZodDto(GoogleLoginSchema) {}
