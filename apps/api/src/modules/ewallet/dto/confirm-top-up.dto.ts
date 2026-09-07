import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const ConfirmTopUpSchema = z.object({
	paymentDate: z.string().min(1, "Tanggal transfer wajib diisi"),
	paymentNote: z.string().optional(),
})

export class ConfirmTopUpDto extends createZodDto(ConfirmTopUpSchema) {}
