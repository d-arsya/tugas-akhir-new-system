import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import {
	RegistrantSchema,
	AcademicYearSchema,
	SettingSchoolSchema,
	LevelSchema,
	SettingAnncSchema,
} from "@psb/dto/common/entity-schemas.dto"

export const RegistrationProofResponseSchema = z.object({
	registrant: RegistrantSchema.optional().nullable(),
	academicYear: AcademicYearSchema.optional().nullable(),
	school: SettingSchoolSchema.optional().nullable(),
	level: LevelSchema.optional().nullable(),
})
export class RegistrationProofResponseDto extends createZodDto(RegistrationProofResponseSchema) {}

export const DecisionProofResponseSchema = z.object({
	registrant: RegistrantSchema.optional().nullable(),
	academicYear: AcademicYearSchema.optional().nullable(),
	school: SettingSchoolSchema.optional().nullable(),
	announcement: SettingAnncSchema.optional().nullable(),
})
export class DecisionProofResponseDto extends createZodDto(DecisionProofResponseSchema) {}
