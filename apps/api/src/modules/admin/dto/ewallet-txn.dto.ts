import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Query, body and response schemas for the Dompet transaction pages — legacy
// `EwalletController@transactionUpdate` and `EwalletTransactionHistoryController` (workstream D-C).

const blank = (input: unknown): boolean => input === undefined || input === null || input === ""

// Empty query values mean "no filter" (legacy ConvertEmptyStringsToNull + `when($request->x != null)`)
const optionalText = z
	.string()
	.trim()
	.optional()
	.transform((value) => (value ? value : undefined))

export const EWALLET_STATUSES = ["valid", "invalid", "process", "waiting"] as const
export const EWALLET_KINDS = ["income", "expense", "purchase"] as const

const optionalStatus = optionalText.pipe(z.enum(EWALLET_STATUSES).optional())
const optionalKind = optionalText.pipe(z.enum(EWALLET_KINDS).optional())

// ─── PATCH transactions/:id ──────────────────────────────────────

// Legacy `attributes` are not customised, so Laravel names the fields `status` and `invalid note`;
// only the `required_if` message is overridden by the controller.
const NOTE_REQUIRED = "Kolom catatan wajib untuk diisi."

/** Summernote leaves `<p><br></p>` behind when nothing was typed — that is no note. */
const hasText = (html: string): boolean => html.replace(/<[^>]*>|&nbsp;/g, "").trim().length > 0

export const EwalletTransactionUpdateSchema = z
	.object({
		status: z.enum(EWALLET_STATUSES, {
			error: (issue) =>
				blank(issue.input) ? "Kolom status wajib untuk diisi." : "Status yang dipilih tidak valid.",
		}),
		invalidNote: z.string().nullish(),
	})
	.superRefine((value, context) => {
		if (value.status === "invalid" && !(value.invalidNote && hasText(value.invalidNote))) {
			context.addIssue({ code: "custom", path: ["invalidNote"], message: NOTE_REQUIRED })
		}
	})
export class EwalletTransactionUpdateDto extends createZodDto(EwalletTransactionUpdateSchema) {}
export type EwalletTransactionUpdateInput = z.infer<typeof EwalletTransactionUpdateSchema>

// ─── GET history ─────────────────────────────────────────────────

export const HISTORY_SORT_KEYS = ["code", "type", "paymentMethod", "totalAmount", "createdAt", "status"] as const

export const EwalletHistoryQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	// `transaction-history/index.blade.php` — the `#show_entry_ewallet` select2
	limit: z.coerce
		.number()
		.int()
		.refine((value) => [10, 25, 50, 100].includes(value), { message: "limit harus 10, 25, 50 atau 100" })
		.default(10),
	search: optionalText,
	orderBy: z.enum(HISTORY_SORT_KEYS).optional(),
	orderDir: z.enum(["asc", "desc"]).optional(),
	// `dd/mm/yyyy` or `dd/mm/yyyy - dd/mm/yyyy`; malformed halves are ignored, never a 500
	date: optionalText,
	status: optionalStatus,
	type: optionalKind,
})
export class EwalletHistoryQueryDto extends createZodDto(EwalletHistoryQuerySchema) {}
export type EwalletHistoryFilter = z.infer<typeof EwalletHistoryQuerySchema>

// ─── GET history-export ──────────────────────────────────────────

export const EwalletHistoryExportSchema = z.object({
	date: optionalText,
	status: optionalStatus,
	type: optionalKind,
	search: optionalText,
})
export class EwalletHistoryExportDto extends createZodDto(EwalletHistoryExportSchema) {}
export type EwalletHistoryExportFilter = z.infer<typeof EwalletHistoryExportSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

const OwnerType = z.enum(["santri", "merchant"])

export const EwalletTransactionDetailSchema = z.object({
	id: z.number(),
	code: z.string().nullable(),
	name: z.string().nullable(),
	type: z.enum(EWALLET_KINDS),
	status: z.enum(EWALLET_STATUSES),
	paymentMethod: z.string().nullable(),
	totalAmount: z.number(),
	transferNewsNumber: z.number().nullable(),
	createdAt: z.string(),
	paymentDate: z.string().nullable(),
	paymentNote: z.string().nullable(),
	invalidNote: z.string().nullable(),
	paymentOnBehalfOf: z.string().nullable(),
	paymentAttachmentUrl: z.string().nullable(),
	ewallet: z.object({ id: z.number(), uniqueId: z.string().nullable(), ownerType: OwnerType }),
	requesterName: z.string().nullable(),
	recipientName: z.string().nullable(),
	editable: z.boolean(),
})
export class EwalletTransactionDetailDto extends createZodDto(EwalletTransactionDetailSchema) {}

export const EwalletHistoryRowSchema = z.object({
	id: z.number(),
	code: z.string().nullable(),
	type: z.enum(EWALLET_KINDS),
	paymentMethod: z.string().nullable(),
	totalAmount: z.number(),
	createdAt: z.string(),
	createdAtTs: z.number(),
	status: z.enum(EWALLET_STATUSES),
	target: z.enum(["transaction", "history", "none"]),
})
export class EwalletHistoryRowDto extends createZodDto(EwalletHistoryRowSchema) {}

export const EwalletHistoryDetailSchema = z.object({
	id: z.number(),
	code: z.string().nullable(),
	type: z.enum(EWALLET_KINDS),
	status: z.enum(EWALLET_STATUSES),
	paymentMethod: z.string().nullable(),
	createdAt: z.string(),
	totalAmount: z.number(),
	items: z.array(z.object({ description: z.string(), price: z.number() })),
	merchant: z.object({ uniqueId: z.string().nullable(), name: z.string().nullable() }),
	student: z.object({ uniqueId: z.string().nullable(), name: z.string().nullable() }),
})
export class EwalletHistoryDetailDto extends createZodDto(EwalletHistoryDetailSchema) {}
