import { z } from "zod"

export const transactionItemSchema = z.object({
	description: z.string().min(1, "Nama item tidak boleh kosong"),
	price: z.number().min(1, "Harga item harus lebih dari Rp 0"),
})

export const storeTransactionSchema = z.object({
	items: z
		.array(transactionItemSchema)
		.min(1, "Transaksi minimal harus memiliki 1 item"),
})

export type StoreTransactionSchemaType = z.infer<typeof storeTransactionSchema>

export const validatePinSchema = z.object({
	pin: z
		.string()
		.length(6, "PIN E-Wallet harus 6 digit")
		.regex(/^\d+$/, "PIN E-Wallet harus berupa angka"),
})

export type ValidatePinSchemaType = z.infer<typeof validatePinSchema>
