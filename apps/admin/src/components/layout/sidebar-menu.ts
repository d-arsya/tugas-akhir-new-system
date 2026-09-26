import type { LinkProps } from "@tanstack/react-router"

import type { LayoutRole } from "@/lib/admin-roles"

import type { SidebarIconName } from "./sidebar-icons"

export type SidebarRoutePath = NonNullable<LinkProps["to"]>

export type MenuCondition = "new" | "legacy"

export const LEGACY_ADMIN_BASE_URL: string =
	(import.meta.env.VITE_LEGACY_ADMIN_URL as string | undefined)?.replace(/\/+$/, "") || "http://localhost:8000"

export type SidebarMenuItem = {
	key: string
	label: string
	to?: SidebarRoutePath
	legacyPath?: string
	condition?: MenuCondition
	icon?: SidebarIconName
	roles?: LayoutRole[]
	badge?: "ewalletProcess"
	children?: SidebarMenuItem[]
}

const SA_ADMIN: LayoutRole[] = ["superadmin", "admin"]
const SA_BENDAHARA: LayoutRole[] = ["superadmin", "bendahara"]
const CASHIER: LayoutRole[] = ["superadmin", "kasir"]
const SA: LayoutRole[] = ["superadmin"]

export const SIDEBAR_MENU: SidebarMenuItem[] = [
	{ key: "dashboard", label: "Dashboard", condition: "new", to: "/dashboard", legacyPath: "/dashboard", icon: "dashboard", roles: SA_ADMIN },
	{ key: "report", label: "Laporan", condition: "new", to: "/reports", legacyPath: "/report", icon: "report", roles: SA_BENDAHARA },
	{
		key: "ewallet",
		label: "Dompet",
		icon: "ewallet",
		roles: CASHIER,
		children: [
			{ key: "ewallet_account", label: "Akun Dompet", condition: "new", to: "/ewallets", legacyPath: "/e-wallet", badge: "ewalletProcess" },
			{ key: "ewallet_history", label: "Riwayat Transaksi", condition: "new", to: "/ewallet-transactions", legacyPath: "/transaction-history" },
		],
	},
	{
		key: "academic",
		label: "Akademik",
		icon: "academic",
		roles: SA_ADMIN,
		children: [
			{
				key: "academic_student",
				label: "Santri",
				children: [
					{ key: "academic_student_all", label: "Data Santri", condition: "new", to: "/students", legacyPath: "/student" },
					{ key: "academic_student_add", label: "Tambah", condition: "new", to: "/students/create", legacyPath: "/student/create/personal?sidebar=true" },
				],
			},
			{
				key: "academic_alumni",
				label: "Alumni",
				children: [
					{ key: "academic_alumni_all", label: "Data Alumni", condition: "new", to: "/alumni", legacyPath: "/alumni" },
					{ key: "academic_alumni_dashboard", label: "Dashboard", condition: "new", to: "/alumni/dashboard", legacyPath: "/coming-soon" },
				],
			},
			{
				key: "academic_registrant",
				label: "PSB",
				children: [
					{ key: "academic_registrant_all", label: "Data PSB", condition: "new", to: "/registrants", legacyPath: "/registrant" },
					{ key: "academic_registrant_add", label: "Tambah", condition: "new", to: "/registrants/create", legacyPath: "/registrant/create/personal" },
				],
			},
		],
	},
	{
		key: "finance",
		label: "Pembayaran Santri",
		icon: "finance",
		roles: SA_BENDAHARA,
		children: [
			{ key: "finance_bill", label: "Tagihan", condition: "new", to: "/student-invoices", legacyPath: "/student-invoice" },
			{ key: "finance_capability", label: "Kesanggupan", condition: "new", to: "/student-capabilities", legacyPath: "/student-capability" },
			{ key: "finance_history", label: "Riwayat", condition: "new", to: "/student-transactions", legacyPath: "/student-transaction" },
		],
	},
	{
		key: "master",
		label: "Data Master",
		icon: "master",
		roles: ["superadmin", "admin", "bendahara", "kasir"],
		children: [
			{
				key: "master_academic_year",
				label: "Tahun Ajaran",
				roles: SA_ADMIN,
				children: [
					{ key: "master_academic_year_all", label: "Semua", condition: "new", to: "/academic-years", legacyPath: "/academic-year" },
					{ key: "master_academic_year_add", label: "Tambah", condition: "new", to: "/academic-years/create", legacyPath: "/academic-year/create" },
				],
			},
			{
				key: "master_finance",
				label: "Keuangan",
				roles: SA_BENDAHARA,
				children: [
					{ key: "master_student_cost", label: "Biaya Santri", condition: "new", to: "/student-costs", legacyPath: "/student-cost" },
					{ key: "master_finance_category", label: "Akun", condition: "new", to: "/accountancy", legacyPath: "/accountancy" },
				],
			},
			{
				key: "master_academic",
				label: "Akademik",
				roles: SA_ADMIN,
				children: [
					{ key: "master_grade", label: "Kelas", condition: "new", to: "/grades", legacyPath: "/grade" },
					{ key: "master_major", label: "Jurusan", condition: "new", to: "/majors", legacyPath: "/major" },
					{ key: "master_level", label: "Jenjang", condition: "new", to: "/levels", legacyPath: "/level" },
				],
			},
			{
				key: "master_merchant",
				label: "Merchant",
				roles: ["superadmin", "admin", "kasir"],
				children: [
					{ key: "master_merchant_all", label: "Data Merchant", condition: "new", to: "/merchants", legacyPath: "/merchant" },
					{ key: "master_merchant_add", label: "Tambah", condition: "new", to: "/merchants/create", legacyPath: "/merchant/create" },
				],
			},
		],
	},
	{
		key: "other",
		label: "Lainnya",
		icon: "other",
		children: [
			{
				key: "other_user",
				label: "Pengelola",
				roles: SA,
				children: [
					{ key: "other_user_all", label: "Semua", condition: "new", to: "/users", legacyPath: "/user" },
					{ key: "other_user_add", label: "Tambah", condition: "new", to: "/users/create", legacyPath: "/user/create" },
				],
			},
			{
				key: "other_setting",
				label: "Pengaturan",
				children: [
					{ key: "other_setting_announcement", label: "Pengumuman PSB", condition: "new", to: "/settings/announcements", legacyPath: "/setting/announcement", roles: SA_ADMIN },
					{ key: "other_setting_form", label: "Form Data Santri", condition: "new", to: "/settings/form", legacyPath: "/setting/form", roles: SA_ADMIN },
					{ key: "other_setting_school", label: "Profil Pondok", condition: "new", to: "/settings/school", legacyPath: "/setting/school", roles: SA_ADMIN },
					{ key: "other_setting_profile", label: "Profil Saya", condition: "new", to: "/my-profile", legacyPath: "/setting/my-profile" },
					{ key: "other_setting_system", label: "Sistem", condition: "new", to: "/settings", legacyPath: "/setting/setting", roles: SA },
				],
			},
			{ key: "other_auth_log", label: "Authentication Log", condition: "new", to: "/auth-logs", legacyPath: "/auth-log", roles: SA },
		],
	},
]

export const filterMenuByRole = (
	items: SidebarMenuItem[],
	role: LayoutRole | null,
): SidebarMenuItem[] => {
	return items.flatMap((item) => {
		if (item.roles && (!role || !item.roles.includes(role))) return []
		if (!item.children) return [item]
		const children = filterMenuByRole(item.children, role)
		return children.length > 0 ? [{ ...item, children }] : []
	})
}

const matchesPath = (to: string, pathname: string): boolean =>
	pathname === to || pathname.startsWith(`${to}/`)

export const findActiveChain = (items: SidebarMenuItem[], pathname: string): string[] => {
	const best = { chain: [] as string[], length: -1 }

	const walk = (nodes: SidebarMenuItem[], parents: string[]): void => {
		for (const node of nodes) {
			const chain = [...parents, node.key]
			if (node.to && matchesPath(node.to, pathname) && node.to.length > best.length) {
				best.chain = chain
				best.length = node.to.length
			}
			if (node.children) walk(node.children, chain)
		}
	}

	walk(items, [])
	return best.chain
}
