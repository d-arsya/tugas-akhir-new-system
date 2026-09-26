import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Legacy `AuthLogController@list` ships the whole table to DataTables; the port pages on the
// server, so the query carries the DataTables state (length menu, smart search, ordering).

/** Column keys the table may order by — legacy marks every column orderable. */
export const AUTH_LOG_SORT_KEYS = [
	"no",
	"email",
	"browser",
	"os",
	"duration",
	"lastSeen",
	"lastLogin",
	"lastLogout",
	"loginStatus",
] as const

export const AuthLogQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	// Legacy DataTables length menu
	limit: z.coerce
		.number()
		.int()
		.refine((value) => [10, 25, 50, 100].includes(value), { message: "limit harus 10, 25, 50 atau 100" })
		.default(10),
	search: z
		.string()
		.trim()
		.optional()
		.transform((value) => (value ? value : undefined)),
	sortBy: z.enum(AUTH_LOG_SORT_KEYS).optional(),
	sortDir: z.enum(["asc", "desc"]).default("asc"),
})
export class AuthLogQueryDto extends createZodDto(AuthLogQuerySchema) {}

export type AuthLogQuery = z.infer<typeof AuthLogQuerySchema>

// ─── Response (Swagger) ─────────────────────────────────────────

export const AuthLogRowSchema = z.object({
	id: z.number(),
	email: z.string().nullable(),
	browser: z.string(),
	os: z.string().nullable(),
	duration: z.string().nullable(),
	lastSeen: z.string(),
	lastLogin: z.string().nullable(),
	lastLogout: z.string().nullable(),
	loginStatus: z.string().nullable(),
})

export class AuthLogResponseDto extends createZodDto(AuthLogRowSchema) {}
