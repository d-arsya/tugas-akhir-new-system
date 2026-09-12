import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const UpdateTransactionItemSchema = z.object({
	description: z.string().min(1, "Deskripsi barang wajib diisi"),
	price: z.coerce.number().int().min(1, "Harga barang minimal Rp 1"),
})

export class UpdateTransactionItemDto extends createZodDto(UpdateTransactionItemSchema) {}
