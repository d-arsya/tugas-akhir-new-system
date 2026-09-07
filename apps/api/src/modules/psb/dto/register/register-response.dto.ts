import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import {
	AcademicYearSchema,
	SettingSchoolSchema,
	SettingAnncSchema,
	LevelSchema,
	SettingFormSchema,
	RegistrantSchema,
} from "@psb/dto/common/entity-schemas.dto"

export const LandingInfoResponseSchema = z.object({
	academicYear: AcademicYearSchema.optional().nullable(),
	school: SettingSchoolSchema.optional().nullable(),
	announcement: SettingAnncSchema.optional().nullable(),
	levels: z.array(LevelSchema).optional(),
	formSettings: z.array(SettingFormSchema).optional(),
	isOpen: z.boolean().optional(),
})
export class LandingInfoResponseDto extends createZodDto(LandingInfoResponseSchema) {}

export const FormSettingsResponseSchema = z.object({
	formSettings: z.array(SettingFormSchema).optional(),
})
export class FormSettingsResponseDto extends createZodDto(FormSettingsResponseSchema) {}

export const CheckEmailResponseSchema = z.object({
	sessionId: z.string(),
	email: z.string(),
	levelId: z.number(),
})
export class CheckEmailResponseDto extends createZodDto(CheckEmailResponseSchema) {}

export const WizardStateResponseSchema = z.object({
	email: z.object({ email: z.string() }).optional().nullable(),
	personal: z.record(z.string(), z.any()).optional().nullable(),
	identity: z.record(z.string(), z.any()).optional().nullable(),
	family: z.record(z.string(), z.any()).optional().nullable(),
	guardian: z.record(z.string(), z.any()).optional().nullable(),
})
export class WizardStateResponseDto extends createZodDto(WizardStateResponseSchema) {}

export const SubmitAttachmentResponseSchema = z.object({
	success: z.boolean(),
	registrantId: z.string(),
	password: z.string().optional(),
	registrant: RegistrantSchema.optional().nullable(),
	auth: z.object({
		accessToken: z.string(),
		refreshToken: z.string(),
	}).optional(),
})
export class SubmitAttachmentResponseDto extends createZodDto(SubmitAttachmentResponseSchema) {}
