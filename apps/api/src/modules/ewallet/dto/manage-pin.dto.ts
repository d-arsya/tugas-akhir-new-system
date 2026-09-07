import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const ValidateCurrentPinSchema = z.object({
	pin: z.string().regex(/^\d{6}$/, "PIN harus berupa 6 digit angka"),
})

export class ValidateCurrentPinDto extends createZodDto(ValidateCurrentPinSchema) {}

export const UpdatePinSchema = z
	.object({
		pin: z.string().regex(/^\d{6}$/, "PIN baru harus berupa 6 digit angka"),
		pinConfirmation: z.string().regex(/^\d{6}$/, "Konfirmasi PIN harus berupa 6 digit angka"),
	})
	.refine((data) => data.pin === data.pinConfirmation, {
		message: "Konfirmasi PIN tidak cocok dengan PIN baru",
		path: ["pinConfirmation"],
	})

export class UpdatePinDto extends createZodDto(UpdatePinSchema) {}

export const ResetPinSchema = z
	.object({
		token: z.string().min(1, "Token reset PIN wajib diisi"),
		pin: z.string().regex(/^\d{6}$/, "PIN baru harus berupa 6 digit angka"),
		pinConfirmation: z.string().regex(/^\d{6}$/, "Konfirmasi PIN harus berupa 6 digit angka"),
	})
	.refine((data) => data.pin === data.pinConfirmation, {
		message: "Konfirmasi PIN tidak cocok dengan PIN baru",
		path: ["pinConfirmation"],
	})

export class ResetPinDto extends createZodDto(ResetPinSchema) {}
