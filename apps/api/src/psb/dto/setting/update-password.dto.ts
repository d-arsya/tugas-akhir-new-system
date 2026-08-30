import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const UpdatePasswordSchema = z
	.object({
		password: z.string().min(8, "Password minimal 8 karakter"),
		passwordConfirmation: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "Konfirmasi password tidak cocok",
		path: ["passwordConfirmation"],
	})

export class UpdatePasswordDto extends createZodDto(UpdatePasswordSchema) {}
