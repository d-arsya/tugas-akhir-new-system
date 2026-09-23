import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Legacy `GradeRequest` (app/Http/Requests/GradeRequest.php).
// `attributes()`: level_id => "jenjang", label => "kelas".
// `label` is `unique:grades,label,{id}` — globally unique across every level, ignoring its
// own row on update. Uniqueness cannot be expressed in zod, so the service raises it with
// `throwFieldErrors({ label: ["Kelas sudah ada sebelumnya"] })` — note: no trailing period,
// exactly as the legacy `messages()` writes it.

const blank = (input: unknown): boolean => input === undefined || input === null || input === ""

export const GradeWriteSchema = z.object({
	levelId: z.number({ error: () => "Kolom jenjang wajib dipilih." }).int("Kolom jenjang wajib dipilih."),
	label: z
		.number({
			error: (issue) => (blank(issue.input) ? "Kolom kelas wajib untuk diisi." : "Kelas harus berupa angka."),
		})
		.int("Kelas harus berupa angka."),
})
export class GradeWriteDto extends createZodDto(GradeWriteSchema) {}
export type GradeWriteInput = z.infer<typeof GradeWriteSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const GradeRowSchema = z.object({
	id: z.number(),
	label: z.number().nullable(),
	name: z.string(),
	levelId: z.number().nullable(),
	levelName: z.string().nullable(),
	createdAt: z.string(),
	createdAtTs: z.number(),
})
export class GradeRowDto extends createZodDto(GradeRowSchema) {}

export const GradeDetailSchema = z.object({
	id: z.number(),
	levelId: z.number().nullable(),
	label: z.number().nullable(),
})
export class GradeDetailDto extends createZodDto(GradeDetailSchema) {}
