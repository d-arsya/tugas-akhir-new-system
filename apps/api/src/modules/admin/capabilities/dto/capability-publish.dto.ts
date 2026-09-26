import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Body + response contracts for the single-santri Kesanggupan writes — legacy
// `StudentCapabilityController@store`, `@change`, `@update` and `@publishInvoice`.
//
// Legacy validates one thing across all four: `ArrayCannotContainNullRule`, which walks
// `$request->position` and rejects a null `amount[$i]`. Everything else — the account ids, the
// rupiah strings, whether the two route parameters even belong to the same santri — reaches SQL
// unchecked.

/**
 * One agreed line.
 *
 * Legacy posts three parallel arrays (`amount[]` from the sliders, `amount[{index}]` from the
 * radios, plus `account_id[]` and `position[]`) and realigns them with `array_search`, whose
 * `false` return is then used as an array index. Pairing the account with its rupiah removes the
 * realignment, and with it the class of bug where a non-contiguous tick list wrote one santri's
 * amount onto another row.
 */
export const CapabilityItemInputSchema = z.object({
	accountancyId: z.coerce.number().int().positive(),
	/**
	 * Masked exactly as the input holds it — `"1.500.000"`. Parsed with the same `unmaskAmount`
	 * the Biaya Santri form uses, so `"0"` stays a legal agreed amount (64 live line items sit at
	 * zero on a `type='maximum'` term) and a decimal comma is truncated rather than rounded.
	 */
	amount: z
		.string({ error: "Kolom kesanggupan wajib untuk diisi." })
		.trim()
		.min(1, "Kolom kesanggupan wajib untuk diisi."),
})

/**
 * POST `@store` and PATCH `@update`.
 *
 * `items` may be empty here — legacy's `store()` writes a capability with no lines when the form
 * posts none, and the santri then sits on level 5 with nothing ticked. It is `publishInvoice` that
 * refuses an empty capability, with `Silakan pilih minimal 1 kesanggupan.`
 *
 * `note` is `varchar(191)`; legacy writes it unvalidated and a longer note came back as a 500.
 */
export const CapabilityWriteSchema = z.object({
	note: z.string().max(191, "Catatan maksimal berisi 191 karakter.").nullish(),
	items: z.array(CapabilityItemInputSchema).default([]),
})
export class CapabilityWriteDto extends createZodDto(CapabilityWriteSchema) {}
export type CapabilityWriteInput = z.infer<typeof CapabilityWriteSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

/**
 * `@store`, `@change` and `@publishInvoice` all answer with this.
 *
 * `invoicesCreated` has no legacy counterpart: `publishInvoice` discards its own return value and
 * swallows its exceptions, so a publish that wrote **zero** invoices still reported
 * "Kesanggupan telah disepakati. Dan tagihan berhasil dibuat." Grade 7 has no applied cost terms
 * at all and does exactly that for its 33 active santri. Reporting the count makes the silent
 * no-op visible; `warning` carries the sentence that explains it.
 */
export const CapabilityPublishResultSchema = z.object({
	message: z.string(),
	invoicesCreated: z.number(),
	warning: z.string().optional(),
	redirect: z.string().optional(),
})
export class CapabilityPublishResultDto extends createZodDto(CapabilityPublishResultSchema) {}
