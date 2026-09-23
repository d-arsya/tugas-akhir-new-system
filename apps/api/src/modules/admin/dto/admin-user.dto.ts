import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Legacy `UserRequest` (app/Http/Requests/UserRequest.php): the same field order, the same
// `bail` behaviour (one message per field) and the messages the legacy validator resolves.

/** Legacy stores the role as a free string; the port validates it (plan decision). */
export const ADMIN_USER_ROLES = ["Admin", "Bendahara", "Kasir E-Wallet"] as const

// Laravel counts a missing key, null and "" as "not filled"
const blank = (input: unknown): boolean => input === undefined || input === null || input === ""

const name = z
	.string({
		error: (issue) => (blank(issue.input) ? "Kolom nama lengkap wajib untuk diisi." : "Nama lengkap harus berupa string."),
	})
	.min(1, "Kolom nama lengkap wajib untuk diisi.")
	.max(255, "Nama lengkap maksimal berisi 255 karakter.")

const gender = z.enum(["male", "female"], {
	error: (issue) => (blank(issue.input) ? "Kolom jenis kelamin wajib dipilih." : "Gender yang dipilih tidak valid."),
})

const role = z.enum(ADMIN_USER_ROLES, {
	error: (issue) => {
		if (blank(issue.input)) return "Kolom role wajib dipilih."
		return typeof issue.input === "string" ? "Role yang dipilih tidak valid." : "Role harus berupa string."
	},
})

// Laravel `boolean` also accepts 0/1 and "0"/"1", which is what the legacy radios post
const isBlocked = z.preprocess(
	(input) => {
		if (input === "1" || input === 1) return true
		if (input === "0" || input === 0) return false
		return input
	},
	z.boolean({
		error: (issue) =>
			blank(issue.input) ? "Kolom status akun wajib dipilih." : "Is blocked harus bernilai true atau false",
	}),
)

// `email.unique` cannot be expressed in zod; the service throws it as a field error
const email = z.email({
	error: (issue) =>
		blank(issue.input) ? "Kolom alamat email wajib untuk diisi." : "Alamat email harus berupa alamat surel yang valid.",
})

export const AdminUserCreateSchema = z.object({ name, gender, role, isBlocked, email })
export class AdminUserCreateDto extends createZodDto(AdminUserCreateSchema) {}

/** Legacy `update()` saves only these four columns — the posted email is ignored. */
export const AdminUserUpdateSchema = z.object({ name, gender, role, isBlocked })
export class AdminUserUpdateDto extends createZodDto(AdminUserUpdateSchema) {}

export type AdminUserCreateInput = z.infer<typeof AdminUserCreateSchema>
export type AdminUserUpdateInput = z.infer<typeof AdminUserUpdateSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const AdminUserRowSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	email: z.string().nullable(),
	role: z.string().nullable(),
	createdAt: z.string(),
	createdAtTs: z.number(),
	isBlocked: z.boolean(),
})
export class AdminUserRowDto extends createZodDto(AdminUserRowSchema) {}

export const AdminUserDetailSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	email: z.string().nullable(),
	role: z.string().nullable(),
	gender: z.enum(["male", "female"]).nullable(),
	isBlocked: z.boolean(),
})
export class AdminUserDetailDto extends createZodDto(AdminUserDetailSchema) {}
