import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const CreateAcademicYearSchema = z.object({
	year: z.string().min(1, "Tahun ajaran wajib diisi (contoh: 2024/2025)"),
	type: z.enum(["reguler", "indent"]).optional().default("reguler"),
	activeKbm: z.string().optional().nullable(),
	costDateStart: z.string().optional().nullable(),
	costDateEnd: z.string().optional().nullable(),
	serialNumber: z.string().optional().nullable(),
	note: z.string().optional().nullable(),
	status: z.boolean().optional().default(true),
	isCurrent: z.boolean().optional().default(false),
})

export class CreateAcademicYearDto extends createZodDto(CreateAcademicYearSchema) {}
export class UpdateAcademicYearDto extends createZodDto(CreateAcademicYearSchema.partial()) {}

export const DelegateAcademicYearSchema = z.object({
	targetAcademicYearId: z.number().int(),
})

export class DelegateAcademicYearDto extends createZodDto(DelegateAcademicYearSchema) {}

export const CreateLevelSchema = z.object({
	name: z.string().min(1, "Nama jenjang wajib diisi"),
	desc: z.string().optional().nullable(),
})

export class CreateLevelDto extends createZodDto(CreateLevelSchema) {}
export class UpdateLevelDto extends createZodDto(CreateLevelSchema.partial()) {}

export const LinkLevelAcademicYearSchema = z.object({
	academicYearId: z.number().int("Academic year ID wajib berupa angka"),
	quota: z.number().int().min(0).optional().default(0),
})

export class LinkLevelAcademicYearDto extends createZodDto(LinkLevelAcademicYearSchema) {}

export const CreateMajorSchema = z.object({
	levelId: z.number().int("Level ID wajib berupa angka"),
	name: z.string().min(1, "Nama jurusan wajib diisi"),
	desc: z.string().optional().nullable(),
})

export class CreateMajorDto extends createZodDto(CreateMajorSchema) {}
export class UpdateMajorDto extends createZodDto(CreateMajorSchema.partial()) {}

export const CreateGradeSchema = z.object({
	levelId: z.number().int("Level ID wajib berupa angka"),
	label: z.number().int("Label kelas wajib berupa angka (misal: 7, 8, 9)"),
})

export class CreateGradeDto extends createZodDto(CreateGradeSchema) {}
export class UpdateGradeDto extends createZodDto(CreateGradeSchema.partial()) {}

export const LevelByGradeSchema = z.object({
	grade: z.number().int(),
})

export class LevelByGradeDto extends createZodDto(LevelByGradeSchema) {}

export const CreateSubGradeSchema = z.object({
	label: z.string().min(1, "Label sub-kelas wajib diisi (misal: A, B, C)"),
})

export class CreateSubGradeDto extends createZodDto(CreateSubGradeSchema) {}
export class UpdateSubGradeDto extends createZodDto(CreateSubGradeSchema.partial()) {}

export const AcademicYearResponseSchema = z.object({
	id: z.number(),
	year: z.string(),
	type: z.string().nullable().optional(),
	activeKbm: z.string().nullable().optional(),
	status: z.boolean().optional(),
	isCurrent: z.boolean().optional(),
	createdAt: z.string().optional(),
})
export class AcademicYearResponseDto extends createZodDto(AcademicYearResponseSchema) {}

export const LevelResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
	status: z.string().nullable().optional(),
	desc: z.string().nullable().optional(),
})
export class LevelResponseDto extends createZodDto(LevelResponseSchema) {}

export const LevelListResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
})
export class LevelListResponseDto extends createZodDto(LevelListResponseSchema) {}

export const LevelAcademicYearResponseSchema = z.object({
	id: z.number(),
	levelId: z.number(),
	academicYearId: z.number(),
	quota: z.number(),
})
export class LevelAcademicYearResponseDto extends createZodDto(LevelAcademicYearResponseSchema) {}

export const MajorResponseSchema = z.object({
	id: z.number(),
	levelId: z.number().nullable().optional(),
	name: z.string(),
	desc: z.string().nullable().optional(),
})
export class MajorResponseDto extends createZodDto(MajorResponseSchema) {}

export const GradeResponseSchema = z.object({
	id: z.number(),
	levelId: z.number().nullable().optional(),
	label: z.number(),
})
export class GradeResponseDto extends createZodDto(GradeResponseSchema) {}

export const GradeLevelResponseSchema = z.object({
	level: LevelResponseSchema.nullable().optional(),
})
export class GradeLevelResponseDto extends createZodDto(GradeLevelResponseSchema) {}

export const SubGradeResponseSchema = z.object({
	id: z.number(),
	label: z.string(),
})
export class SubGradeResponseDto extends createZodDto(SubGradeResponseSchema) {}
