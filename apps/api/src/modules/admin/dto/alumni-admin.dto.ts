import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const AlumniFilterSchema = z.object({
	search: z.string().optional(),
	page: z.coerce.number().optional().default(1),
	limit: z.coerce.number().optional().default(10),
})

export class AlumniFilterDto extends createZodDto(AlumniFilterSchema) {}

export const UpdateAlumniSchema = z.object({
	fullname: z.string().optional(),
	gender: z.string().optional(),
	alumniTalent: z.string().optional(),
	advancedStudy: z.string().optional(),
	profession: z.string().optional(),
	marriageStatus: z.string().optional(),
	alumniPhone: z.string().optional(),
	alumniEmail: z.string().email().optional(),
})

export class UpdateAlumniDto extends createZodDto(UpdateAlumniSchema) {}

export const AlumniResponseSchema = z.object({
	id: z.number(),
	studentId: z.number().nullable().optional(),
	nis: z.string().nullable().optional(),
	fullname: z.string().nullable().optional(),
	academicYear: z.string().nullable().optional(),
	graduateAt: z.string().nullable().optional(),
	alumniEmail: z.string().nullable().optional(),
})

export class AlumniResponseDto extends createZodDto(AlumniResponseSchema) {}

export const AlumniYearGroupResponseSchema = z.object({
	graduationYear: z.string(),
	count: z.number(),
})

export class AlumniYearGroupResponseDto extends createZodDto(AlumniYearGroupResponseSchema) {}
