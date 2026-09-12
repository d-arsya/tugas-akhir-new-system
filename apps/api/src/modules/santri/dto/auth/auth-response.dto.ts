import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const SantriUserPayloadSchema = z.object({
	id: z.number(),
	nis: z.string().nullish(),
	email: z.string().nullish(),
})

export const SantriAuthResultSchema = z.object({
	requires2fa: z.boolean(),
	studentId: z.number().optional(),
	email: z.string().nullish(),
	accessToken: z.string().optional(),
	refreshToken: z.string().optional(),
	user: SantriUserPayloadSchema.optional(),
})

export class SantriAuthResultDto extends createZodDto(SantriAuthResultSchema) {}

export const SantriMessageResponseSchema = z.object({
	message: z.string(),
})

export class SantriMessageResponseDto extends createZodDto(SantriMessageResponseSchema) {}

export const SantriEmailInfoSchema = z.object({
	id: z.number(),
	nis: z.string().nullish(),
	email: z.string().nullish(),
	emailVerifiedAt: z.string().nullish(),
})

export class SantriEmailInfoDto extends createZodDto(SantriEmailInfoSchema) {}

export const SantriRefreshResultSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
})

export class SantriRefreshResultDto extends createZodDto(SantriRefreshResultSchema) {}

