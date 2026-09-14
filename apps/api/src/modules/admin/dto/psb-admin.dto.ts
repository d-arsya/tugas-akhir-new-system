import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const PsbRegistrantFilterSchema = z.object({
	status: z.enum(["wait", "reserve", "approve", "reject", "invalid"]).optional(),
	registrationPath: z.enum(["indent", "reguler"]).optional(),
	levelId: z.coerce.number().optional(),
	search: z.string().optional(),
	page: z.coerce.number().optional().default(1),
	limit: z.coerce.number().optional().default(10),
})

export class PsbRegistrantFilterDto extends createZodDto(PsbRegistrantFilterSchema) {}

export const UpdateRegistrantSchema = z.object({
	fullname: z.string().optional(),
	shortname: z.string().optional(),
	religion: z.string().optional(),
	gender: z.enum(["male", "female"]).optional(),
	placeOfBirth: z.string().optional(),
	dateOfBirth: z.string().optional(),
	nationality: z.enum(["wna", "wni"]).optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	nisn: z.string().optional(),
	nik: z.string().optional(),
	schoolName: z.string().optional(),
	fatherFullname: z.string().optional(),
	motherFullname: z.string().optional(),
	guardianFullname: z.string().optional(),
})

export class UpdateRegistrantDto extends createZodDto(UpdateRegistrantSchema) {}

export const UpdateRegistrantStatusSchema = z.object({
	approvalStatus: z.enum(["wait", "reserve", "approve", "reject"]).optional(),
	dataValidation: z.enum(["valid", "invalid", "fixed"]).optional(),
	dataValidationNote: z.string().optional().nullable(),
	reason: z.string().optional().nullable(),
	levelId: z.number().optional(),
	gradeId: z.number().optional(),
})

export class UpdateRegistrantStatusDto extends createZodDto(UpdateRegistrantStatusSchema) {}

export const CreateRegistrantManualSchema = z.object({
	academicYearId: z.number(),
	levelId: z.number(),
	registrationPath: z.enum(["indent", "reguler"]).optional().default("reguler"),
	fullname: z.string().min(1, "Nama lengkap wajib diisi"),
	email: z.string().email("Format email tidak valid"),
	gender: z.enum(["male", "female"]),
	phone: z.string().optional(),
	nisn: z.string().optional(),
	nik: z.string().optional(),
})

export class CreateRegistrantManualDto extends createZodDto(CreateRegistrantManualSchema) {}

export const PsbAcademicYearStatsResponseSchema = z.object({
	id: z.number(),
	year: z.string(),
	totalRegistrants: z.number(),
	regulerCount: z.number(),
	indentCount: z.number(),
	approvedCount: z.number(),
	rejectedCount: z.number(),
})

export class PsbAcademicYearStatsResponseDto extends createZodDto(PsbAcademicYearStatsResponseSchema) {}

export const PsbRegistrantResponseSchema = z.object({
	id: z.number(),
	registrantId: z.string().nullable().optional(),
	academicYearId: z.number().nullable().optional(),
	levelId: z.number().nullable().optional(),
	fullname: z.string().nullable().optional(),
	email: z.string().nullable().optional(),
	gender: z.string().nullable().optional(),
	registrationPath: z.string().nullable().optional(),
	approvalStatus: z.string().nullable().optional(),
	dataValidation: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
	createdAt: z.string().optional(),
})

export class PsbRegistrantResponseDto extends createZodDto(PsbRegistrantResponseSchema) {}
