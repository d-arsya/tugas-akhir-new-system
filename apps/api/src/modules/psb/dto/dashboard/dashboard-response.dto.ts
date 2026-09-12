import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import {
	RegistrantSchema,
	SettingSchoolSchema,
	SettingAnncSchema,
} from "@psb/dto/common/entity-schemas.dto"

export const DashboardResponseSchema = z.object({
	registrant: RegistrantSchema.nullish(),
	school: SettingSchoolSchema.nullish(),
	announcement: SettingAnncSchema.nullish(),
	statusInfo: z.object({
		status: z.string(),
		label: z.string(),
		description: z.string().optional(),
	}).optional(),
})
export class DashboardResponseDto extends createZodDto(DashboardResponseSchema) {}

