import { z } from "zod"

export const loginSchema = z.object({
	nis: z.string().min(1, "NIS wajib diisi"),
	password: z.string().min(1, "Password wajib diisi"),
	remember: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
	email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
	.object({
		email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
		token: z.string().min(1, "Token tidak valid"),
		password: z.string().min(6, "Password minimal 6 karakter"),
		passwordConfirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "Password dan konfirmasi password tidak cocok",
		path: ["passwordConfirmation"],
	})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const twoFactorSchema = z.object({
	code: z
		.string()
		.length(6, "Kode 2FA harus 6 digit angka")
		.regex(/^\d+$/, "Kode 2FA hanya boleh berisi angka"),
})

export type TwoFactorFormData = z.infer<typeof twoFactorSchema>

export const updateEmailSchema = z.object({
	email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
})

export type UpdateEmailFormData = z.infer<typeof updateEmailSchema>
