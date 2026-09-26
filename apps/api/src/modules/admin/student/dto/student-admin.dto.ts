import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Bodies of the Santri writes. Legacy posts `id[]` plus the action's own field; an empty id list is
// accepted here and refused by the action with legacy's own failure message.

const ids = z.array(z.number().int().positive())

export class AdminStudentIdsBodyDto extends createZodDto(z.object({ ids })) {}

export class AdminStudentMajorBodyDto extends createZodDto(z.object({ ids, major: z.string().nullable() })) {}

export class AdminStudentSubGradeBodyDto extends createZodDto(z.object({ ids, subGrade: z.string().nullable() })) {}

export class AdminStudentStatusBodyDto extends createZodDto(z.object({ ids, isBlocked: z.boolean() })) {}

export class AdminStudentDropoutBodyDto extends createZodDto(z.object({ ids, dropoutNote: z.string().optional() })) {}

/** `SocietyStepCheckDto` — one wizard step (`POST create/validate/:step`). */
export class AdminStudentStepCheckBodyDto extends createZodDto(
	z.object({
		values: z.record(z.string(), z.string()),
		diseases: z.array(z.object({ name: z.string(), status: z.string() })),
	}),
) {}
