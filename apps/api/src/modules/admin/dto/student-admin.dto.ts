import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const StudentFilterSchema = z.object({
	search: z.string().optional(),
	subGrade: z.string().optional(),
	status: z.string().optional(),
	page: z.coerce.number().optional().default(1),
	limit: z.coerce.number().optional().default(10),
})

export class StudentFilterDto extends createZodDto(StudentFilterSchema) {}

export const UpdateStudentGradeSchema = z.object({
	nis: z.string().optional(),
	nisn: z.string().optional(),
	nik: z.string().optional(),
	fullname: z.string().optional(),
	shortname: z.string().optional(),
	gender: z.enum(["male", "female"]).optional(),
	religion: z.string().optional(),
	placeOfBirth: z.string().optional(),
	dateOfBirth: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	address: z.string().optional(),
	subDistrict: z.string().optional(),
	district: z.string().optional(),
	city: z.string().optional(),
	province: z.string().optional(),
	postalCode: z.string().optional(),
	fatherFullname: z.string().optional(),
	motherFullname: z.string().optional(),
	guardianFullname: z.string().optional(),
	status: z.string().optional(),
})

export class UpdateStudentGradeDto extends createZodDto(UpdateStudentGradeSchema) {}

export const UpdateStudentMajorSchema = z.object({
	majorId: z.number().optional(),
	majorName: z.string().optional(),
})

export class UpdateStudentMajorDto extends createZodDto(UpdateStudentMajorSchema) {}

export const UpdateStudentSubGradeSchema = z.object({
	subGradeId: z.number().optional(),
	subGradeName: z.string().optional(),
})

export class UpdateStudentSubGradeDto extends createZodDto(UpdateStudentSubGradeSchema) {}

export const UpdateStudentStatusSchema = z.object({
	status: z.string(),
})

export class UpdateStudentStatusDto extends createZodDto(UpdateStudentStatusSchema) {}

export const BulkStudentPromotionSchema = z.object({
	studentGradeIds: z.array(z.number()),
})

export class BulkStudentPromotionDto extends createZodDto(BulkStudentPromotionSchema) {}

export const BulkStudentRetentionSchema = z.object({
	studentGradeIds: z.array(z.number()),
})

export class BulkStudentRetentionDto extends createZodDto(BulkStudentRetentionSchema) {}

export const BulkStudentGraduationSchema = z.object({
	studentGradeIds: z.array(z.number()),
})

export class BulkStudentGraduationDto extends createZodDto(BulkStudentGraduationSchema) {}

export const BulkStudentDropoutSchema = z.object({
	studentGradeIds: z.array(z.number()),
	dropoutNote: z.string().optional(),
})

export class BulkStudentDropoutDto extends createZodDto(BulkStudentDropoutSchema) {}

export const CreateStudentManualSchema = z.object({
	academicYearId: z.number(),
	levelId: z.number(),
	gradeId: z.number(),
	subGradeId: z.number().optional(),
	fullname: z.string().min(1, "Nama santri wajib diisi"),
	email: z.string().email("Format email tidak valid"),
	gender: z.enum(["male", "female"]),
	phone: z.string().optional(),
	nis: z.string().optional(),
	nisn: z.string().optional(),
})

export class CreateStudentManualDto extends createZodDto(CreateStudentManualSchema) {}

export const StudentCapabilityItemSchema = z.object({
	accountancyId: z.number(),
	amount: z.number(),
})

export const StudentCapabilitySchema = z.object({
	capabilities: z.array(StudentCapabilityItemSchema),
	note: z.string().optional(),
})

export class StudentCapabilityDto extends createZodDto(StudentCapabilitySchema) {}

export const StudentGradeResponseSchema = z.object({
	id: z.number(),
	studentId: z.number(),
	academicYearId: z.number(),
	levelId: z.number().nullable().optional(),
	gradeId: z.number().nullable().optional(),
	subGradeId: z.number().nullable().optional(),
	majorId: z.number().nullable().optional(),
	status: z.string().nullable().optional(),
	nis: z.string().nullable().optional(),
	fullname: z.string().nullable().optional(),
	email: z.string().nullable().optional(),
	gender: z.string().nullable().optional(),
})

export class StudentGradeResponseDto extends createZodDto(StudentGradeResponseSchema) {}

export const StudentCapabilityResponseSchema = z.object({
	id: z.number(),
	studentId: z.number(),
	studentGradeId: z.number(),
	status: z.string(),
	note: z.string().nullable().optional(),
	approveDate: z.string().nullable().optional(),
	items: z.array(
		z.object({
			id: z.number(),
			accountancyId: z.number(),
			amount: z.number(),
		}),
	).optional(),
})

export class StudentCapabilityResponseDto extends createZodDto(StudentCapabilityResponseSchema) {}

// Swagger shapes for the two filter endpoints on StudentAdminController.
// Moved here from the deleted dto/academic.dto.ts, which belonged to the old
// placeholder academic module; these describe student-admin's own responses.
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

export const GradeResponseSchema = z.object({
	id: z.number(),
	levelId: z.number().nullable().optional(),
	label: z.number(),
})

export class GradeResponseDto extends createZodDto(GradeResponseSchema) {}
