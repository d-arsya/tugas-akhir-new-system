import type { LinkProps } from "@tanstack/react-router"

import type { LayoutRole } from "@/lib/admin-roles"

import type { SidebarIconName } from "./sidebar-icons"

export type SidebarRoutePath = NonNullable<LinkProps["to"]>

export type SidebarMenuItem = {
	key: string
	label: string
	to?: SidebarRoutePath
	icon?: SidebarIconName
	// Omitted = visible to every role (legacy items without @can)
	roles?: LayoutRole[]
	badge?: "ewalletProcess"
	children?: SidebarMenuItem[]
}

const SA_ADMIN: LayoutRole[] = ["superadmin", "admin"]
const SA_BENDAHARA: LayoutRole[] = ["superadmin", "bendahara"]
// Legacy Gate "do-as-cashier" passes for Kasir E-Wallet or Superadmin
const CASHIER: LayoutRole[] = ["superadmin", "kasir"]
const SA: LayoutRole[] = ["superadmin"]

// Mirrors admin.pondokroja.com/resources/views/layouts/sidebar-left.blade.php 1:1
export const SIDEBAR_MENU: SidebarMenuItem[] = [
	{ key: "dashboard", label: "Dashboard", to: "/dashboard", icon: "dashboard", roles: SA_ADMIN },
	{ key: "report", label: "Laporan", to: "/reports", icon: "report", roles: SA_BENDAHARA },
	{
		key: "ewallet",
		label: "Dompet",
		icon: "ewallet",
		roles: CASHIER,
		children: [
			{ key: "ewallet_account", label: "Akun Dompet", to: "/ewallets", badge: "ewalletProcess" },
			{ key: "ewallet_history", label: "Riwayat Transaksi", to: "/ewallet-transactions" },
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
					{ key: "academic_student_all", label: "Data Santri", to: "/students" },
					{ key: "academic_student_add", label: "Tambah", to: "/students/create" },
				],
			},
			{
				key: "academic_alumni",
				label: "Alumni",
				children: [
					{ key: "academic_alumni_all", label: "Data Alumni", to: "/alumni" },
					{ key: "academic_alumni_dashboard", label: "Dashboard", to: "/alumni/dashboard" },
				],
			},
			{
				key: "academic_registrant",
				label: "PSB",
				children: [
					{ key: "academic_registrant_all", label: "Data PSB", to: "/registrants" },
					{ key: "academic_registrant_add", label: "Tambah", to: "/registrants/create" },
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
			{ key: "finance_bill", label: "Tagihan", to: "/student-invoices" },
			{ key: "finance_capability", label: "Kesanggupan", to: "/student-capabilities" },
			{ key: "finance_history", label: "Riwayat", to: "/student-transactions" },
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
					{ key: "master_academic_year_all", label: "Semua", to: "/academic-years" },
					{ key: "master_academic_year_add", label: "Tambah", to: "/academic-years/create" },
				],
			},
			{
				key: "master_finance",
				label: "Keuangan",
				roles: SA_BENDAHARA,
				children: [
					{ key: "master_student_cost", label: "Biaya Santri", to: "/student-costs" },
					{ key: "master_finance_category", label: "Akun", to: "/accountancy" },
				],
			},
			{
				key: "master_academic",
				label: "Akademik",
				roles: SA_ADMIN,
				children: [
					{ key: "master_grade", label: "Kelas", to: "/grades" },
					{ key: "master_major", label: "Jurusan", to: "/majors" },
					{ key: "master_level", label: "Jenjang", to: "/levels" },
				],
			},
			{
				key: "master_merchant",
				label: "Merchant",
				roles: ["superadmin", "admin", "kasir"],
				children: [
					{ key: "master_merchant_all", label: "Data Merchant", to: "/merchants" },
					{ key: "master_merchant_add", label: "Tambah", to: "/merchants/create" },
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
					{ key: "other_user_all", label: "Semua", to: "/users" },
					{ key: "other_user_add", label: "Tambah", to: "/users/create" },
				],
			},
			{
				key: "other_setting",
				label: "Pengaturan",
				children: [
					{ key: "other_setting_announcement", label: "Pengumuman PSB", to: "/settings/announcements", roles: SA_ADMIN },
					{ key: "other_setting_form", label: "Form Data Santri", to: "/settings/form", roles: SA_ADMIN },
					{ key: "other_setting_school", label: "Profil Pondok", to: "/settings/school", roles: SA_ADMIN },
					{ key: "other_setting_profile", label: "Profil Saya", to: "/my-profile" },
					{ key: "other_setting_system", label: "Sistem", to: "/settings", roles: SA },
				],
			},
			{ key: "other_auth_log", label: "Authentication Log", to: "/auth-logs", roles: SA },
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

// Returns the key chain (root → leaf) of the most specific item matching the path
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
