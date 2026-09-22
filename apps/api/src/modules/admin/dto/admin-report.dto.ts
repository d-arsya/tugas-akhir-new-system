import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Empty query values mean "no filter" (legacy ConvertEmptyStringsToNull + `when($request->input(...))`)
const optionalText = z
	.string()
	.trim()
	.optional()
	.transform((value) => (value ? value : undefined))

// Legacy date inputs are bootstrap-datepicker `dd/mm/yyyy` strings
const optionalDate = optionalText.refine((value) => value === undefined || /^\d{2}\/\d{2}\/\d{4}$/.test(value), {
	message: "Format tanggal harus dd/mm/yyyy",
})

const baseFilter = {
	from: optionalDate,
	to: optionalDate,
	academicYear: optionalText,
	grade: optionalText,
	subGrade: optionalText,
	search: optionalText,
}

const tableParams = {
	page: z.coerce.number().int().positive().default(1),
	// Legacy DataTables length menu
	limit: z.coerce
		.number()
		.int()
		.refine((value) => [10, 25, 50, 100].includes(value), { message: "limit harus 10, 25, 50 atau 100" })
		.default(10),
	sortDir: z.enum(["asc", "desc"]).default("asc"),
}

export const INCOME_DETAIL_SORT_KEYS = [
	"code",
	"fullname",
	"nis",
	"amount",
	"description",
	"grade",
	"subGrade",
] as const

export const ARREAR_SORT_KEYS = ["nis", "fullname", "name", "amount", "dueDate", "grade", "subGrade"] as const

export const IncomeFilterSchema = z.object(baseFilter)
export class IncomeFilterDto extends createZodDto(IncomeFilterSchema) {}

export const IncomeDetailQuerySchema = z.object({
	...baseFilter,
	...tableParams,
	sortBy: z.enum(INCOME_DETAIL_SORT_KEYS).optional(),
})
export class IncomeDetailQueryDto extends createZodDto(IncomeDetailQuerySchema) {}

export const ArrearFilterSchema = z.object({ ...baseFilter, accountancy: optionalText })
export class ArrearFilterDto extends createZodDto(ArrearFilterSchema) {}

export const ArrearQuerySchema = z.object({
	...baseFilter,
	...tableParams,
	accountancy: optionalText,
	sortBy: z.enum(ARREAR_SORT_KEYS).optional(),
})
export class ArrearQueryDto extends createZodDto(ArrearQuerySchema) {}

export type IncomeFilter = z.infer<typeof IncomeFilterSchema>
export type IncomeDetailQuery = z.infer<typeof IncomeDetailQuerySchema>
export type ArrearFilter = z.infer<typeof ArrearFilterSchema>
export type ArrearQuery = z.infer<typeof ArrearQuerySchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const ReportOptionsResponseSchema = z.object({
	academicYears: z.array(z.string()),
	grades: z.array(z.number()),
	subGrades: z.array(z.string()),
	accountancies: z.array(z.string()),
})
export class ReportOptionsResponseDto extends createZodDto(ReportOptionsResponseSchema) {}

export const IncomeDetailRowSchema = z.object({
	code: z.string(),
	paidAt: z.string().nullable(),
	fullname: z.string().nullable(),
	nis: z.string().nullable(),
	amount: z.number(),
	description: z.string(),
	grade: z.number().nullable(),
	subGrade: z.string().nullable(),
})
export class IncomeDetailRowDto extends createZodDto(IncomeDetailRowSchema) {}

export const IncomeRecapResponseSchema = z.object({
	rows: z.array(z.object({ accName: z.string(), totalAmount: z.number() })),
	totalAmount: z.number(),
	totalData: z.number(),
})
export class IncomeRecapResponseDto extends createZodDto(IncomeRecapResponseSchema) {}

export const ArrearRowSchema = z.object({
	id: z.number(),
	nis: z.string().nullable(),
	fullname: z.string().nullable(),
	name: z.string().nullable(),
	amount: z.number(),
	dueDate: z.string().nullable(),
	grade: z.string().nullable(),
	subGrade: z.string().nullable(),
})
export class ArrearRowDto extends createZodDto(ArrearRowSchema) {}
