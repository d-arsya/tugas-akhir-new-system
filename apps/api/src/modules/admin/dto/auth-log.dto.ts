import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const AuthLogResponseSchema = z.object({
	id: z.number(),
	userId: z.number().nullable().optional(),
	email: z.string().nullable().optional(),
	ipAddress: z.string().nullable().optional(),
	userAgent: z.string().nullable().optional(),
	guard: z.string().nullable().optional(),
	loginAt: z.string().nullable().optional(),
	logoutAt: z.string().nullable().optional(),
	loginStatus: z.string().nullable().optional(),
	createdAt: z.string().optional(),
})

export class AuthLogResponseDto extends createZodDto(AuthLogResponseSchema) {}

