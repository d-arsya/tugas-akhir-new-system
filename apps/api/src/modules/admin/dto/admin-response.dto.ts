import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const AdminMessageResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
})

export class AdminMessageResponseDto extends createZodDto(AdminMessageResponseSchema) {}
