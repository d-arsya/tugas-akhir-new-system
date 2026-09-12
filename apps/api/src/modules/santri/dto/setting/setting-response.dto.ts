import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const SantriSettingPageResponseSchema = z.object({
	email: z.string().nullish(),
	isEmailVerified: z.boolean(),
	emailVerifiedAt: z.string().nullish(),
	enabled2fa: z.boolean(),
})

export class SantriSettingPageResponseDto extends createZodDto(SantriSettingPageResponseSchema) {}

export const SantriSettingToggle2faResponseSchema = z.object({
	message: z.string(),
	enabled2fa: z.boolean(),
})

export class SantriSettingToggle2faResponseDto extends createZodDto(SantriSettingToggle2faResponseSchema) {}

export const SantriMessageResponseSchema = z.object({
	message: z.string(),
})

export class SantriMessageResponseDto extends createZodDto(SantriMessageResponseSchema) {}
