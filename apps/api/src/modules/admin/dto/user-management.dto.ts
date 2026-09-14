import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const CreateUserSchema = z.object({
	name: z.string().min(1, "Nama wajib diisi"),
	email: z.string().email("Format email tidak valid"),
	gender: z.enum(["male", "female"]).optional().nullable(),
	role: z.enum(["Superadmin", "Admin", "Bendahara", "Kasir E-Wallet"]),
})

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

export const UpdateUserSchema = CreateUserSchema.partial()

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

export const UserResponseSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	email: z.string().nullable(),
	role: z.string().nullable(),
	gender: z.string().nullable(),
	isBlocked: z.boolean(),
	blockedAt: z.string().nullable().optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
})


export class UserResponseDto extends createZodDto(UserResponseSchema) {}

