import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const MerchantResetPasswordSchema = z
	.object({
		email: z.string().email("Format email tidak valid"),
		token: z.string().min(1, "Token reset password wajib diisi"),
		password: z.string().min(8, "Password minimal 8 karakter"),
		passwordConfirmation: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "Konfirmasi password tidak cocok",
		path: ["passwordConfirmation"],
	})

export class MerchantResetPasswordDto extends createZodDto(MerchantResetPasswordSchema) {}
