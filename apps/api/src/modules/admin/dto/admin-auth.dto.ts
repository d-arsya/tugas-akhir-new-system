import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const AdminLoginSchema = z.object({
	email: z.string().email("Format email tidak valid"),
	password: z.string().min(1, "Password wajib diisi"),
	rememberMe: z.boolean().optional().default(false),
})

export class AdminLoginDto extends createZodDto(AdminLoginSchema) {}

export const ChangePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
	newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
})

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}

export const UpdateProfileSchema = z.object({
	name: z.string().min(1, "Nama wajib diisi"),
	email: z.string().email("Format email tidak valid"),
	gender: z.enum(["male", "female"]).optional().nullable(),
})

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}

export const AdminUserResponseSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	email: z.string().nullable(),
	role: z.string().nullable(),
	gender: z.string().nullable(),
})

export class AdminUserResponseDto extends createZodDto(AdminUserResponseSchema) {}

export const AdminAuthResultSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	user: AdminUserResponseSchema,
})

export class AdminAuthResultDto extends createZodDto(AdminAuthResultSchema) {}

