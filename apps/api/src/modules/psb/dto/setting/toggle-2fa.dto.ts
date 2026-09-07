import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const Toggle2faSchema = z.object({
	enabled: z.boolean(),
})

export class Toggle2faDto extends createZodDto(Toggle2faSchema) {}
