import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Response contracts for the read half of Kesanggupan (legacy `StudentCapabilityController`
// `@academicYearList`, `@gradeList`, `@capabilityList`, `@studentCapabilityList`,
// `@studentCapabilityItemList`).
//
// Legacy validates none of these and reads every id straight off the route binding; here they are
// route params behind `ParseIntPipe`, so there is no request body to describe. `@storeToSession`
// **is** a body, and it lives in `capability-mass.dto.ts` with the mass pages that consume its
// redirect (see the report — both workstreams wrote it, and P2-C's is the one registered).

// ─── Response shapes, for Swagger only ───────────────────────────────────────
// The runtime types come from `@roja/types`; these mirror them so the generated document is not
// a wall of `object`. Kept in the same order as the contract file.

const CapabilityAcademicYearRowSchema = z.object({
	id: z.number(),
	year: z.string().nullable(),
	costPeriod: z.string(),
	statusLabel: z.enum(["Berjalan", "Berakhir", "-"]).nullable(),
})
export class CapabilityAcademicYearRowDto extends createZodDto(CapabilityAcademicYearRowSchema) {}

const CapabilityGradeRowSchema = z.object({
	id: z.number(),
	label: z.number().nullable(),
	name: z.string(),
	masterCostDefined: z.boolean(),
	studentCount: z.number(),
	note: z.string(),
	canDrillDown: z.boolean(),
})
export class CapabilityGradeRowDto extends createZodDto(CapabilityGradeRowSchema) {}

const CapabilityStudentRowSchema = z.object({
	studentGradeId: z.number(),
	nis: z.string().nullable(),
	fullName: z.string().nullable(),
	parentOrGuardian: z.string().nullable(),
	subGrade: z.string().nullable(),
	capabilityCount: z.number(),
	hasCapability: z.boolean(),
})
export class CapabilityStudentRowDto extends createZodDto(CapabilityStudentRowSchema) {}

const StudentCardSchema = z.object({
	studentGradeId: z.number(),
	studentId: z.number(),
	nis: z.string().nullable(),
	fullName: z.string().nullable(),
	photoUrl: z.string().nullable(),
	academicYear: z.string().nullable(),
	levelName: z.string().nullable(),
	grade: z.string().nullable(),
	subGrade: z.string().nullable(),
	fatherName: z.string().nullable(),
})

const CapabilityStudentPageSchema = z.object({
	student: StudentCardSchema,
	alert: z.enum(["no-capability", "unagreed", "agreed"]).nullable(),
	academicYearId: z.number(),
	gradeId: z.number(),
})
export class CapabilityStudentPageDto extends createZodDto(CapabilityStudentPageSchema) {}

const CapabilityHistoryRowSchema = z.object({
	id: z.number(),
	ordinal: z.number(),
	approveDate: z.string().nullable(),
	approveDateTs: z.number().nullable(),
	itemCount: z.number(),
	status: z.enum(["approve", "disapprove", "changed"]).nullable(),
	statusLabel: z.enum(["Disepakati", "Belum disepakati", "Dirubah"]).nullable(),
	note: z.string().nullable(),
})
export class CapabilityHistoryRowDto extends createZodDto(CapabilityHistoryRowSchema) {}

const CapabilityItemRowSchema = z.object({
	costTermId: z.number(),
	accountancyId: z.number(),
	name: z.string().nullable(),
	type: z.enum(["maximum", "option"]),
	period: z.enum(["once", "monthly"]),
	periodLabel: z.enum(["Sekali", "Bulanan"]),
	amount: z.number().nullable(),
	maxAmount: z.number().nullable(),
	options: z.array(z.number()),
	step: z.number(),
	selected: z.boolean(),
})
export class CapabilityItemRowDto extends createZodDto(CapabilityItemRowSchema) {}

const CapabilityItemPageSchema = z.object({
	student: StudentCardSchema,
	capability: z.object({
		id: z.number(),
		ordinal: z.number(),
		status: z.enum(["approve", "disapprove", "changed"]).nullable(),
		statusLabel: z.enum(["Disepakati", "Belum disepakati", "Dirubah"]).nullable(),
		note: z.string().nullable(),
		approveDate: z.string().nullable(),
	}),
	editable: z.boolean(),
	academicYearId: z.number(),
	gradeId: z.number(),
})
export class CapabilityItemPageDto extends createZodDto(CapabilityItemPageSchema) {}
