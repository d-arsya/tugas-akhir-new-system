import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Payloads for the bulk half of Kesanggupan — legacy `StudentCapabilityController@storeToSession`
// (141-190), `@massCreate*` (192-242), `@massStore` (244-300), `@massEdit*` (302-393) and
// `@massUpdate` (395-465).
//
// Legacy kept the tick list in **one global session key** (`student_grade_id`) and posted three
// parallel arrays (`amount[]` / `amount[{index}]`, `account_id[]`, `position[]`) that it realigned
// with `array_search`. Both are replaced here: the selection travels in the request and every id
// is re-validated server-side, and the amounts arrive already paired with their account.

/** A selected santri — `tbr_student_grades.id`, never `students.id`. */
const studentGradeId = z.coerce.number().int().positive()

/**
 * `?students=1,2,3`, exactly as `AdminCapabilitiesApi.selection()` serialises it.
 *
 * Empty is legal and means "nothing ticked": legacy's `massCreate`/`massEdit` answer an empty
 * session by redirecting back to the santri list, so the pages must be able to say so rather
 * than 422 on the way in.
 */
export const CapabilityMassQuerySchema = z.object({
	students: z
		.string()
		.optional()
		.transform((value) =>
			(value ?? "")
				.split(",")
				.map((part) => Number(part.trim()))
				.filter((part) => !Number.isNaN(part)),
		)
		.refine((ids) => ids.every((id) => Number.isInteger(id) && id > 0), "Santri yang dipilih tidak valid."),
})

export class CapabilityMassQueryDto extends createZodDto(CapabilityMassQuerySchema) {}
export type CapabilityMassQueryInput = z.infer<typeof CapabilityMassQuerySchema>

/**
 * `@storeToSession` (141-190). Legacy validated `id` as `required|array` and `action` as
 * `required`, then read `action` as a free string where only the literal `'create'` branched —
 * anything else, including a typo, silently fell through to the mass-**edit** route. The enum
 * closes that.
 */
export const CapabilitySelectionSchema = z.object({
	studentGradeIds: z
		.array(studentGradeId, { error: () => "Kolom santri wajib untuk diisi." })
		.min(1, "Kolom santri wajib untuk diisi."),
	action: z.enum(["create", "update"], { error: () => "Kolom aksi wajib untuk diisi." }),
})

export class CapabilitySelectionDto extends createZodDto(CapabilitySelectionSchema) {}
export type CapabilitySelectionInput = z.infer<typeof CapabilitySelectionSchema>

/**
 * One agreed line.
 *
 * `amount` stays a **string** because the form holds it autoNumeric-masked ("1.500.000") and the
 * contract types it that way; the service unmasks it. `"0"` is a legal amount — 64 live line
 * items carry zero on a `type='maximum'` account — so nothing here rejects a zero.
 *
 * There is no `position` field. Legacy's `position[]` existed only to re-pair `amount[]` with
 * `account_id[]` through `array_search`, whose `false` return PHP then used as index `0`; pairing
 * the two values in one object removes the entire class of defect.
 */
export const CapabilityItemInputSchema = z.object({
	accountancyId: z.coerce.number().int().positive(),
	amount: z.string({ error: () => "Semua kesanggupan wajib untuk dipilih." }).min(1, "Semua kesanggupan wajib untuk dipilih."),
})

/**
 * `@massStore` and `@massUpdate`.
 *
 * `@massStore` validated only `ArrayCannotContainNullRule` (attribute `kesanggupan`, message
 * `Semua kesanggupan wajib untuk dipilih.`); `@massUpdate` had **no validation at all**, so an
 * empty body reached `whereNotIn('accountancy_id', null)`. Both endpoints share this schema.
 *
 * `shownAccountancyIds` is legacy's `showed_id[]`: the accounts the shared mass-edit form
 * actually displayed. Anything a santri already holds that is *not* in this list is replicated
 * forward onto the new capability (`massUpdate:440-446`) instead of being dropped. Legacy read
 * it straight off the request; an omitted value here means "the form showed nothing", which is
 * the safe reading — every existing account is then carried over untouched.
 */
export const CapabilityMassWriteSchema = z.object({
	studentGradeIds: z
		.array(studentGradeId, { error: () => "Kolom santri wajib untuk diisi." })
		.min(1, "Kolom santri wajib untuk diisi."),
	note: z.string().nullish(),
	items: z
		.array(CapabilityItemInputSchema, { error: () => "Silakan pilih minimal 1 kesanggupan." })
		.min(1, "Silakan pilih minimal 1 kesanggupan."),
	shownAccountancyIds: z.array(z.coerce.number().int().positive()).optional(),
})

export class CapabilityMassWriteDto extends createZodDto(CapabilityMassWriteSchema) {}
export type CapabilityMassWriteInput = z.infer<typeof CapabilityMassWriteSchema>
