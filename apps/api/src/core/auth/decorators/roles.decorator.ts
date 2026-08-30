import { SetMetadata } from "@nestjs/common"

export type UserRole = "superadmin" | "admin" | "bendahara" | "kasir_ewallet"

export const ROLES_KEY = "roles"
export const Roles = (...roles: UserRole[]): ReturnType<typeof SetMetadata> =>
	SetMetadata(ROLES_KEY, roles)
