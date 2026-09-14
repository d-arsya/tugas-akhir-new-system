import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const UpdateSchoolSettingSchema = z.object({
	name: z.string().optional(),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	website: z.string().optional(),
	logo: z.string().optional(),
})

export class UpdateSchoolSettingDto extends createZodDto(UpdateSchoolSettingSchema) {}

export const UpdateAnnouncementSchema = z.object({
	successDesc: z.string().optional().nullable(),
	failedDesc: z.string().optional().nullable(),
	failedIndentTestDesc: z.string().optional().nullable(),
	dateStart: z.string().optional().nullable(),
	dateEnd: z.string().optional().nullable(),
	information: z.string().optional().nullable(),
	additionalInformation: z.string().optional().nullable(),
})

export class UpdateAnnouncementDto extends createZodDto(UpdateAnnouncementSchema) {}

export const SettingSchoolResponseSchema = z.object({
	id: z.number(),
	name: z.string().nullable().optional(),
	address: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
	email: z.string().nullable().optional(),
	website: z.string().nullable().optional(),
	logo: z.string().nullable().optional(),
})
export class SettingSchoolResponseDto extends createZodDto(SettingSchoolResponseSchema) {}

export const SettingAnncResponseSchema = z.object({
	id: z.number(),
	academicYearId: z.number().nullable().optional(),
	levelId: z.number().nullable().optional(),
	successDesc: z.string().nullable().optional(),
	failedDesc: z.string().nullable().optional(),
	failedIndentTestDesc: z.string().nullable().optional(),
	information: z.string().nullable().optional(),
})
export class SettingAnncResponseDto extends createZodDto(SettingAnncResponseSchema) {}

export const SettingFormResponseSchema = z.object({
	id: z.number(),
	levelId: z.number().nullable().optional(),
	name: z.string().nullable().optional(),
	isOpen: z.boolean().optional(),
})
export class SettingFormResponseDto extends createZodDto(SettingFormResponseSchema) {}

export const SettingAllResponseSchema = z.object({
	school: SettingSchoolResponseSchema.nullable().optional(),
	announcements: z.array(SettingAnncResponseSchema).optional(),
	forms: z.array(SettingFormResponseSchema).optional(),
})
export class SettingAllResponseDto extends createZodDto(SettingAllResponseSchema) {}
