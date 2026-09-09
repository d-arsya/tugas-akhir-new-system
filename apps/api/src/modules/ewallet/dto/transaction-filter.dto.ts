import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const TransactionFilterSchema = z.object({
	status: z.enum(["waiting", "valid", "invalid", "process"]).optional(),
	dateStart: z.string().optional(),
	dateEnd: z.string().optional(),
	search: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
})

export class TransactionFilterDto extends createZodDto(TransactionFilterSchema) {}
