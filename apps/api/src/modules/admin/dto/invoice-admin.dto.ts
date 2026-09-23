import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Query + body contracts for the read half of Tagihan Santri.
// Legacy `StudentInvoiceController@studentListServerSide`, `@listBillServerSide` and `@update`
// read these straight off the DataTables / form request with no validation at all; the port
// validates them so a malformed `order[0][column]` can no longer reach SQL.

// Legacy `ConvertEmptyStringsToNull` + `!empty($request->input(...))`: a blank filter means "no filter"
const optionalText = z
	.string()
	.trim()
	.optional()
	.transform((value) => (value ? value : undefined))

// The `#show_entry` / `#show_entry_bill` select2 menus offer exactly these four lengths
const tableParams = {
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce
		.number()
		.int()
		.refine((value) => [10, 25, 50, 100].includes(value), { message: "limit harus 10, 25, 50 atau 100" })
		.default(10),
	search: optionalText,
}

/**
 * The santri picker's sortable columns.
 *
 * Legacy's `orderCol()` indexes an eight-entry array with `order[0][column] - 1` while only
 * seven columns are sortable, so every column from "Kls" rightwards ordered by its left-hand
 * neighbour's field ("Kls" by `guardian_fullname`, "Tagihan" by `sub_grade`) and "Blm. Lunas"
 * was unreachable. Each key here names its own column instead.
 */
export const STUDENT_INVOICE_SORT_KEYS = [
	"nis",
	"fullName",
	"parentOrGuardian",
	"grade",
	"subGrade",
	"invoiceCount",
	"unpaidCount",
] as const

export const StudentInvoiceListQuerySchema = z.object({
	...tableParams,
	orderBy: z.enum(STUDENT_INVOICE_SORT_KEYS).optional(),
	// DataTables `order: [[1, "desc"]]` — NISP, descending
	orderDir: z.enum(["asc", "desc"]).default("desc"),
	grade: optionalText,
	subGrade: optionalText,
})
export class StudentInvoiceListQueryDto extends createZodDto(StudentInvoiceListQuerySchema) {}
export type StudentInvoiceListInput = z.infer<typeof StudentInvoiceListQuerySchema>

/** The Tagihan tab's sortable columns — legacy's `orderColBill()` array, which maps correctly. */
export const INVOICE_BILL_SORT_KEYS = ["name", "amount", "paid", "balance", "status", "dueDate"] as const

/**
 * The two eye-toggles. Both start `deactive`, which is **not** "no filter": it narrows to
 * `status = 'unpaid' AND reminder < now()`.
 */
const toggle = z.enum(["active", "deactive"]).default("deactive")

export const InvoiceBillQuerySchema = z.object({
	...tableParams,
	orderBy: z.enum(INVOICE_BILL_SORT_KEYS).optional(),
	// DataTables `order: [[7, "asc"]]` — Jatuh Tempo, ascending
	orderDir: z.enum(["asc", "desc"]).default("asc"),
	paid: toggle,
	unpaid: toggle,
	cost: optionalText,
})
export class InvoiceBillQueryDto extends createZodDto(InvoiceBillQuerySchema) {}
export type InvoiceBillInput = z.infer<typeof InvoiceBillQuerySchema>

/**
 * `@update` writes `note` with no validation, against a **varchar(191)** column, so a longer
 * note reached Postgres and came back as a 500. Validated at the real column width instead.
 *
 * `note` is **required** (nullable, not optional): the contract declares `note: string | null`,
 * and a body that simply omits the field must not be accepted as "clear the note". The legacy
 * form always posts the textarea, so nothing user-visible depends on the looser reading.
 */
export const UpdateInvoiceNoteSchema = z.object({
	note: z
		.string({ error: (issue) => (issue.input === undefined ? "Kolom catatan wajib untuk diisi." : "Catatan harus berupa string.") })
		.max(191, "Catatan maksimal berisi 191 karakter.")
		.nullable(),
})
export class UpdateInvoiceNoteDto extends createZodDto(UpdateInvoiceNoteSchema) {}
export type UpdateInvoiceNoteInput = z.infer<typeof UpdateInvoiceNoteSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const StudentInvoiceListRowSchema = z.object({
	studentGradeId: z.number(),
	studentId: z.number(),
	nis: z.string().nullable(),
	fullName: z.string().nullable(),
	parentOrGuardian: z.string().nullable(),
	grade: z.string().nullable(),
	subGrade: z.string().nullable(),
	invoiceCount: z.number(),
	unpaidCount: z.number(),
})
export class StudentInvoiceListRowDto extends createZodDto(StudentInvoiceListRowSchema) {}

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

export const InvoiceDetailPageSchema = z.object({
	student: InvoiceStudentCardSchema,
	summary: z.object({
		totalUnpaid: z.number(),
		unpaidItemCount: z.number(),
		installmentItemCount: z.number(),
	}),
	costOptions: z.array(z.object({ id: z.number(), name: z.string().nullable() })),
})
export class InvoiceDetailPageDto extends createZodDto(InvoiceDetailPageSchema) {}

export const InvoiceBillRowSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	amount: z.number(),
	paid: z.number(),
	balance: z.number(),
	status: z.enum(["paid", "unpaid"]).nullable(),
	paymentMethod: z.enum(["cash", "installment"]).nullable(),
	statusLabel: z.enum(["Belum Dibayar", "Dibayar", "Diangsur"]).nullable(),
	dueDate: z.string().nullable(),
	dueDateTs: z.number().nullable(),
	isOverdue: z.boolean(),
	selectable: z.boolean(),
})
export class InvoiceBillRowDto extends createZodDto(InvoiceBillRowSchema) {}

export const InvoiceTransactionRowSchema = z.object({
	id: z.number(),
	transactionCode: z.string().nullable(),
	paidAt: z.string().nullable(),
	paidAtTs: z.number().nullable(),
	amount: z.number(),
	itemCount: z.number(),
	description: z.string().nullable(),
	cancelNote: z.string().nullable().optional(),
})
export class InvoiceTransactionRowDto extends createZodDto(InvoiceTransactionRowSchema) {}

export const InvoiceBillDetailSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	title: z.string(),
	periodBadge: z.string(),
	amount: z.number(),
	dueDate: z.string().nullable(),
	createdAt: z.string().nullable(),
	note: z.string().nullable(),
	student: InvoiceStudentCardSchema,
	transactions: z.array(
		z.object({
			id: z.number(),
			transactionCode: z.string().nullable(),
			note: z.string().nullable(),
			paidAt: z.string().nullable(),
			pay: z.number(),
		}),
	),
	totalPaid: z.number(),
	costRemain: z.number(),
})
export class InvoiceBillDetailDto extends createZodDto(InvoiceBillDetailSchema) {}
