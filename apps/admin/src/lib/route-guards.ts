import { redirect } from "@tanstack/react-router"

import { normalizeRole, type LayoutRole } from "@/lib/admin-roles"
import useAuthStore from "@/stores/auth.store"

export const requireRoles = (...allowed: LayoutRole[]): void => {
	const role = normalizeRole(useAuthStore.getState().user?.role)
	if (role && allowed.includes(role)) return
	if (role === "kasir") throw redirect({ to: "/ewallets" })
	throw redirect({ to: "/dashboard" })
}
