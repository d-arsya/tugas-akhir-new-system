import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const UpdateProfileSchema = z.object({
	fullname: z.string().min(1, "Nama lengkap wajib diisi"),
})

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
