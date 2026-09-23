import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Query + response schemas for Riwayat Transaksi (legacy `StudentTransactionController`).
// Owned by WS P1-C.

// Empty query values mean "no filter" (legacy ConvertEmptyStringsToNull + `!empty($request->input(…))`)
const optionalText = z
	.string()
	.trim()
	.optional()
	.transform((value) => (value ? value : undefined))

// `student-transaction/index.blade.php:42-60` — two bootstrap-datepickers, `format: "dd/mm/yyyy"`
const optionalDate = optionalText.refine((value) => value === undefined || /^\d{2}\/\d{2}\/\d{4}$/.test(value), {
	message: "Format tanggal harus dd/mm/yyyy",
})

/**
 * `orderCol()` (`StudentTransactionController.php:152-165`), keyed by the contract's row
 * fields rather than the DataTables column index legacy reads.
 *
 * **`:59-60` fix.** Legacy calls `orderCol($request)` and reads `$request->order[0]['dir']`
 * *before* the `if ($request->ajax())` guard at `:62`, so opening `/student-transaction/listServer`
 * in a browser dereferences a null `$request->order` and 500s. Both are optional here and
 * default to the table's own initial sort.
 */
export const TRANSACTION_SORT_KEYS = [
	"paidAt",
	"amount",
	"itemCount",
	"description",
	"nis",
	"fullName",
	"grade",
] as const

export const StudentTransactionListQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	// `index.blade.php:17-22` — the `#show_entry` select2
	limit: z.coerce
		.number()
		.int()
		.refine((value) => [10, 25, 50, 100].includes(value), { message: "limit harus 10, 25, 50 atau 100" })
		.default(10),
	search: optionalText,
	orderBy: z.enum(TRANSACTION_SORT_KEYS).optional(),
	orderDir: z.enum(["asc", "desc"]).optional(),
	from: optionalDate,
	to: optionalDate,
})
export class StudentTransactionListQueryDto extends createZodDto(StudentTransactionListQuerySchema) {}

export type StudentTransactionListFilter = z.infer<typeof StudentTransactionListQuerySchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const StudentTransactionListRowSchema = z.object({
	id: z.number(),
	transactionCode: z.string().nullable(),
	paidAt: z.string().nullable(),
	paidAtTs: z.number().nullable(),
	amount: z.number(),
	itemCount: z.number(),
	description: z.string().nullable(),
	nis: z.string().nullable(),
	fullName: z.string().nullable(),
	grade: z.string().nullable(),
	subGrade: z.string().nullable(),
})
export class StudentTransactionListRowDto extends createZodDto(StudentTransactionListRowSchema) {}

const InvoiceStudentCardSchema = z.object({
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

export const StudentTransactionDetailSchema = z.object({
	id: z.number(),
	transactionCode: z.string().nullable(),
	paidAt: z.string().nullable(),
	createdAt: z.string().nullable(),
	amount: z.number(),
	description: z.string().nullable(),
	note: z.string().nullable(),
	status: z.enum(["valid", "invalid"]),
	cancelNote: z.string().nullable(),
	student: InvoiceStudentCardSchema,
	items: z.array(
		z.object({
			invoiceId: z.number(),
			name: z.string().nullable(),
			dueDate: z.string().nullable(),
			pay: z.number(),
			amount: z.number(),
		}),
	),
	totalAmount: z.number(),
	totalPaid: z.number(),
	balance: z.number(),
})
export class StudentTransactionDetailDto extends createZodDto(StudentTransactionDetailSchema) {}
