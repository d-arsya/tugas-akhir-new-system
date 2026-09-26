import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { blank } from "@admin/common/dto-fields"

// Legacy `LevelRequest` (app/Http/Requests/LevelRequest.php).
// Its `attributes()` say `name => 'nama janjang'` and `status => 'status psb'` — "janjang"
// is a legacy typo for "jenjang" and it is user-visible, so it is kept verbatim.

const name = z
	.string({
		error: (issue) =>
			blank(issue.input) ? "Kolom nama janjang wajib untuk diisi." : "Nama janjang harus berupa string.",
	})
	.min(1, "Kolom nama janjang wajib untuk diisi.")
	.max(255, "Nama janjang maksimal berisi 255 karakter.")

// Legacy validates `status` as `required` only, so a bad value reached the DB enum and 500-ed.
// The port validates the two allowed values (plan decision).
const status = z.enum(["show", "hide"], {
	error: (issue) =>
		blank(issue.input) ? "Kolom status psb wajib dipilih." : "Status psb yang dipilih tidak valid.",
})

export const LevelWriteSchema = z.object({ name, status })
export class LevelWriteDto extends createZodDto(LevelWriteSchema) {}
export type LevelWriteInput = z.infer<typeof LevelWriteSchema>

/** All four delegate handlers share `['level_id' => 'required']` with this message. */
export const LevelDelegateSchema = z.object({
	levelId: z
		.number({
			error: (issue) =>
				blank(issue.input) ? "Kolom jenjang wajib untuk dipilih." : "Kolom jenjang wajib untuk dipilih.",
		})
		.int(),
})
export class LevelDelegateDto extends createZodDto(LevelDelegateSchema) {}
export type LevelDelegateInput = z.infer<typeof LevelDelegateSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const LevelDeleteTargetSchema = z.enum([
	"delete",
	"delegate-major",
	"delegate-grade",
	"delegate-registrant",
	"delegate-student",
])

export const LevelRowSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	status: z.enum(["show", "hide"]).nullable(),
	createdAt: z.string(),
	createdAtTs: z.number(),
	deleteTarget: LevelDeleteTargetSchema,
})
export class LevelRowDto extends createZodDto(LevelRowSchema) {}

export const LevelDetailSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	status: z.enum(["show", "hide"]).nullable(),
})
export class LevelDetailDto extends createZodDto(LevelDetailSchema) {}

export const LevelOptionSchema = z.object({ id: z.number(), name: z.string().nullable() })
export class LevelOptionDto extends createZodDto(LevelOptionSchema) {}

export const LevelDeleteStepSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	step: LevelDeleteTargetSchema,
	levels: z.array(LevelOptionSchema),
	redirect: z.string().nullable(),
})
export class LevelDeleteStepDto extends createZodDto(LevelDeleteStepSchema) {}
