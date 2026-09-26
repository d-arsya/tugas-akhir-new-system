import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { blank } from "@admin/common/dto-fields"

// Legacy `SubGradeController` validates inline — there is no FormRequest class:
//   $request->validate(['label' => 'required|string|max:50'])
// With no `attributes()` override, `:attribute` stays the raw field name, "label".
// Legacy has no uniqueness rule, so duplicate labels are allowed here too.

export const SubGradeWriteSchema = z.object({
	label: z
		.string({
			error: (issue) => (blank(issue.input) ? "Kolom label wajib untuk diisi." : "Label harus berupa string."),
		})
		.min(1, "Kolom label wajib untuk diisi.")
		.max(50, "Label maksimal berisi 50 karakter."),
})
export class SubGradeWriteDto extends createZodDto(SubGradeWriteSchema) {}
export type SubGradeWriteInput = z.infer<typeof SubGradeWriteSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const SubGradeRowSchema = z.object({
	id: z.number(),
	label: z.string().nullable(),
	createdAt: z.string(),
	createdAtTs: z.number(),
})
export class SubGradeRowDto extends createZodDto(SubGradeRowSchema) {}

export const SubGradeDetailSchema = z.object({ id: z.number(), label: z.string().nullable() })
export class SubGradeDetailDto extends createZodDto(SubGradeDetailSchema) {}
