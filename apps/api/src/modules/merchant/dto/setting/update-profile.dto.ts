import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const UpdateMerchantProfileSchema = z.object({
	merchantName: z.string().min(1, "Nama toko / merchant wajib diisi"),
	phone: z.string().min(1, "Nomor telepon wajib diisi"),
	address: z.string().min(1, "Alamat wajib diisi"),
})

export class UpdateMerchantProfileDto extends createZodDto(UpdateMerchantProfileSchema) {}
