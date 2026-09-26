import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const AdminMessageResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
})

export class AdminMessageResponseDto extends createZodDto(AdminMessageResponseSchema) {}

export const AdminRedirectResultSchema = z.object({ message: z.string(), redirect: z.string() })
export class AdminRedirectResultDto extends createZodDto(AdminRedirectResultSchema) {}
export type AdminRedirectResult = z.infer<typeof AdminRedirectResultSchema>
