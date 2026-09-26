import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { blank } from "@admin/common/dto-fields"

// Legacy `MajorRequest` (app/Http/Requests/MajorRequest.php).
// `attributes()`: name => "nama", level => "jenjang". The legacy form field is `level`
// while the column is `level_id`; the port uses `levelId` and keeps the message wording.
// `desc` carries no rule at all in legacy, so it stays unvalidated here too.

const name = z
	.string({
		error: (issue) => (blank(issue.input) ? "Kolom nama wajib untuk diisi." : "Nama harus berupa string."),
	})
	.min(1, "Kolom nama wajib untuk diisi.")
	.max(255, "Nama maksimal berisi 255 karakter.")

const levelId = z
	.number({ error: () => "Kolom jenjang wajib dipilih." })
	.int("Kolom jenjang wajib dipilih.")

export const MajorWriteSchema = z.object({
	name,
	levelId,
	desc: z.string().nullish(),
})
export class MajorWriteDto extends createZodDto(MajorWriteSchema) {}
export type MajorWriteInput = z.infer<typeof MajorWriteSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const MajorRowSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	levelId: z.number().nullable(),
	levelName: z.string().nullable(),
	desc: z.string().nullable(),
	createdAt: z.string(),
	createdAtTs: z.number(),
})
export class MajorRowDto extends createZodDto(MajorRowSchema) {}

export const MajorDetailSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	levelId: z.number().nullable(),
	desc: z.string().nullable(),
})
export class MajorDetailDto extends createZodDto(MajorDetailSchema) {}
