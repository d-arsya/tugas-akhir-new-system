import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const TransactionItemSchema = z.object({
	description: z.string().min(1, "Deskripsi barang wajib diisi"),
	price: z.coerce.number().int().min(1, "Harga barang minimal Rp 1"),
})

export const StoreTransactionSchema = z.object({
	items: z.array(TransactionItemSchema).min(1, "Minimal 1 item transaksi"),
})

export class StoreTransactionDto extends createZodDto(StoreTransactionSchema) {}
