import { z } from "zod"

export const loginSchema = z.object({
	uniqueNumber: z.string().min(1, "Nomor Unik Merchant wajib diisi"),
	password: z.string().min(1, "Password wajib diisi"),
})

export type LoginSchemaType = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
	email: z.string().email("Format email tidak valid"),
})

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password minimal 8 karakter"),
		passwordConfirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "Konfirmasi password tidak cocok",
		path: ["passwordConfirmation"],
	})

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>

export const twoFactorSchema = z.object({
	code: z
		.string()
		.length(6, "Kode 2FA harus 6 digit")
		.regex(/^\d+$/, "Kode 2FA harus berupa angka"),
})

export type TwoFactorSchemaType = z.infer<typeof twoFactorSchema>
