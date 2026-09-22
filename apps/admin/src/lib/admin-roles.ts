export type LayoutRole = "superadmin" | "admin" | "bendahara" | "kasir"

// Role strings arrive in several shapes (API: "Kasir E-Wallet", mocks: "KASIR_EWALLET")
export const normalizeRole = (role: string | null | undefined): LayoutRole | null => {
	const key = (role ?? "").toLowerCase().replace(/[\s_-]+/g, "")
	if (key === "superadmin") return "superadmin"
	if (key === "admin") return "admin"
	if (key === "bendahara") return "bendahara"
	if (key.startsWith("kasir")) return "kasir"
	return null
}

const ROLE_LABELS: Record<LayoutRole, string> = {
	superadmin: "Superadmin",
	admin: "Admin",
	bendahara: "Bendahara",
	kasir: "Kasir E-Wallet",
}

export const roleLabel = (role: LayoutRole | null): string => (role ? ROLE_LABELS[role] : "")
