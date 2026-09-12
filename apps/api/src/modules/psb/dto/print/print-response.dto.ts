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
	registrant: RegistrantSchema.nullish(),
	academicYear: AcademicYearSchema.nullish(),
	school: SettingSchoolSchema.nullish(),
	level: LevelSchema.nullish(),
})
export class RegistrationProofResponseDto extends createZodDto(RegistrationProofResponseSchema) {}

export const DecisionProofResponseSchema = z.object({
	registrant: RegistrantSchema.nullish(),
	academicYear: AcademicYearSchema.nullish(),
	school: SettingSchoolSchema.nullish(),
	announcement: SettingAnncSchema.nullish(),
})
export class DecisionProofResponseDto extends createZodDto(DecisionProofResponseSchema) {}

