import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const PsbAuthResultSchema = z.object({
	accessToken: z.string().optional(),
	refreshToken: z.string().optional(),
	requires2fa: z.boolean().optional(),
	email: z.string().optional(),
	message: z.string().optional(),
})

export class PsbAuthResultDto extends createZodDto(PsbAuthResultSchema) {}

export const MessageResponseSchema = z.object({
	message: z.string(),
})

export class MessageResponseDto extends createZodDto(MessageResponseSchema) {}
