import { redirect } from "@tanstack/react-router"

import { normalizeRole, type LayoutRole } from "@/lib/admin-roles"
import useAuthStore from "@/stores/auth.store"

/**
 * Mirrors the legacy `@can` gates on the sidebar: a role that cannot see the menu entry
 * is sent away, and Kasir E-Wallet lands on its own page like elsewhere in the app.
 */
export const requireRoles = (...allowed: LayoutRole[]): void => {
	const role = normalizeRole(useAuthStore.getState().user?.role)
	if (role && allowed.includes(role)) return
	if (role === "kasir") throw redirect({ to: "/ewallets" })
	throw redirect({ to: "/dashboard" })
}
