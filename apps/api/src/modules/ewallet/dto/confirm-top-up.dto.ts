import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const ConfirmTopUpSchema = z
	.object({
		paymentDate: z.string().optional(),
		payment_date: z.string().optional(),
		paymentNote: z.string().optional(),
		payment_note: z.string().optional(),
	})
	.transform((data) => ({
		paymentDate: (data.paymentDate || data.payment_date || "").trim(),
		paymentNote: data.paymentNote || data.payment_note,
	}))
	.refine((data) => data.paymentDate.length > 0, {
		message: "Tanggal transfer wajib diisi",
		path: ["paymentDate"],
	})

export class ConfirmTopUpDto extends createZodDto(ConfirmTopUpSchema) {}
