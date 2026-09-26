import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Legacy `StudentInvoiceRequest` (app/Http/Requests/StudentInvoiceRequest.php) plus the two
// inline `$request->validate()` calls in `StudentInvoiceController@cancelTransaction` (684-688).
//
// Rules are declared in the legacy `rules()` order — `desc`, `amount`, `note` — because that is
// the order Laravel reports failures in, and `default-ajax.js` prints them in payload order.
// The messages come from `resources/lang/id/validation.php` interpolated with the request's own
// `attributes()`: `required` is `Kolom :attribute wajib untuk diisi.` and `string` is
// `:Attribute harus berupa string.` (`:Attribute` upper-cases the first letter only).

/**
 * The invoice selection, which legacy kept in one global session key (`idInvoice`).
 *
 * Fix F-5: `getDataInvoice` wrote that key with no santri attached and `createTransaction`
 * ignored its own `$studentGrade` parameter when reading it back, so two browser tabs open on
 * two santri shared one selection and the second tab paid the first santri's invoices against
 * the second santri. The selection travels in the payload now, and the service re-checks every
 * id against `student_grade_id` before it writes anything.
 */
export const InvoiceSelectionSchema = z.object({
	studentGradeId: z.coerce
		.number({ error: () => "Santri yang dipilih tidak valid." })
		.int("Santri yang dipilih tidak valid.")
		.positive("Santri yang dipilih tidak valid."),
	invoiceIds: z
		.array(z.coerce.number().int().positive(), { error: () => "Kolom tagihan wajib untuk diisi." })
		.min(1, "Kolom tagihan wajib untuk diisi."),
})

export class InvoiceSelectionDto extends createZodDto(InvoiceSelectionSchema) {}
export type InvoiceSelectionInput = z.infer<typeof InvoiceSelectionSchema>

/**
 * `storeTransaction`'s payload.
 *
 * `amount` stays a **string**: legacy validates `required|string` against the autoNumeric-masked
 * text ("1.500.000") and only then parses it, so a numeric body is a different request than the
 * form sends. The parse itself lives in the service, because fix F-3 is precisely about *where*
 * the parse happens relative to the zero check.
 *
 * There is deliberately no `amounts[]` field. Legacy posted one hidden input per invoice and
 * indexed it by position (fix F-8), which is how a concurrently-paid invoice ended up closing a
 * later invoice with an empty amount. The per-invoice figures are recomputed server-side from
 * the locked rows instead, so the browser cannot name a price at all.
 */
export const CreateTransactionSchema = InvoiceSelectionSchema.extend({
	desc: z
		.string({ error: () => "Kolom keterangan wajib untuk diisi." })
		.min(1, "Kolom keterangan wajib untuk diisi."),
	amount: z
		.string({ error: () => "Kolom dibayar wajib untuk diisi." })
		.min(1, "Kolom dibayar wajib untuk diisi."),
	note: z.string({ error: () => "Catatan harus berupa string." }).nullish(),
})

export class CreateTransactionDto extends createZodDto(CreateTransactionSchema) {}
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>

/** `cancelTransaction` (684-688): `['cancel_note' => 'required|string']`, attribute `alasan dibatalkan`. */
export const CancelTransactionSchema = z.object({
	cancelNote: z
		.string({ error: () => "Kolom alasan dibatalkan wajib untuk diisi." })
		.min(1, "Kolom alasan dibatalkan wajib untuk diisi."),
})

export class CancelTransactionDto extends createZodDto(CancelTransactionSchema) {}
export type CancelTransactionInput = z.infer<typeof CancelTransactionSchema>

/**
 * `updateTransaction` (655-673). Legacy validates nothing here and writes `cancel_note` only
 * while the transaction is already `invalid`; that condition is re-checked in the service, so a
 * hand-made request cannot attach a cancellation reason to a payment that is still valid.
 */
export const UpdateTransactionNoteSchema = z.object({
	/**
	 * Required, though it may be `null`.
	 *
	 * Legacy reads `$request->note` straight into the update, so a request that omits the field
	 * wipes the stored note and answers 200. The frozen contract declares `note: string | null`,
	 * and the form always sends it, so nothing user-visible depends on the looseness — but a
	 * partial payload should be a 422 rather than a silent erasure of a bendahara's note.
	 */
	note: z.string({ error: () => "Kolom catatan wajib untuk diisi." }).nullable(),
	cancelNote: z.string({ error: () => "Alasan dibatalkan harus berupa string." }).nullish(),
})

export class UpdateTransactionNoteDto extends createZodDto(UpdateTransactionNoteSchema) {}
export type UpdateTransactionNoteInput = z.infer<typeof UpdateTransactionNoteSchema>

// --- Response shapes, for the OpenAPI document ---------------------------------------------

/** What the payment form bills for, one line per selected invoice, keyed by id and never position. */
export const InvoiceSelectionResultSchema = z.object({
	studentGradeId: z.number(),
	items: z.array(
		z.object({
			invoiceId: z.number(),
			name: z.string().nullable(),
			dueDate: z.string().nullable(),
			amount: z.number(),
		}),
	),
	total: z.number(),
})

export class InvoiceSelectionResultDto extends createZodDto(InvoiceSelectionResultSchema) {}

export const CreateTransactionResultSchema = z.object({
	message: z.string(),
	transactionId: z.number(),
	redirect: z.string(),
})

export class CreateTransactionResultDto extends createZodDto(CreateTransactionResultSchema) {}
