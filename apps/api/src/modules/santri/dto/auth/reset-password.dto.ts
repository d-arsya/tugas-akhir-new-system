import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const SantriResetPasswordSchema = z
	.object({
		email: z.string().email("Format email tidak valid"),
		token: z.string().min(1, "Token reset password wajib diisi"),
		password: z.string().min(6, "Password minimal 6 karakter"),
		passwordConfirmation: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "Konfirmasi password tidak cocok",
		path: ["passwordConfirmation"],
	})

export class SantriResetPasswordDto extends createZodDto(SantriResetPasswordSchema) {}
