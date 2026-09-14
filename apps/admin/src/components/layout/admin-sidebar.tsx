import { useState, useEffect, type JSX } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import {
	LayoutDashboard,
	Users,
	ShieldAlert,
	Settings,
	Calendar,
	GraduationCap,
	BookOpen,
	Layers,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	X,
	School,
	Shield,
	Receipt,
	Award,
	UserPlus,
	Wallet,
	Store,
	FileText,
	DollarSign,
	Sliders,
} from "lucide-react"

export interface NavLeafItem {
	to: string
	label: string
	icon?: React.ComponentType<{ className?: string }>
}

export interface NavGroupItem {
	key: string
	label: string
	icon?: React.ComponentType<{ className?: string }>
	to?: string
	children?: (NavLeafItem | NavGroupItem)[]
}

export interface AdminSidebarProps {
	collapsed: boolean
	onToggleCollapse: () => void
	mobileOpen: boolean
	onCloseMobile: () => void
	userRole: string
}

function isGroupItem(item: NavLeafItem | NavGroupItem): item is NavGroupItem {
	return "children" in item && Array.isArray((item as NavGroupItem).children)
}

export function AdminSidebar({
	collapsed,
	onToggleCollapse,
	mobileOpen,
	onCloseMobile,
	userRole,
}: AdminSidebarProps): JSX.Element {
	const routerState = useRouterState()
	const currentPath = routerState.location.pathname
	const isSuperAdmin = userRole === "SUPERADMIN"
	const isSuperOrAdmin = isSuperAdmin || userRole === "ADMIN"
	const isBendahara = userRole === "BENDAHARA" || isSuperAdmin
	const isKasir = userRole === "KASIR_EWALLET" || isSuperAdmin

	// Build menu tree according to legacy sidebar-left.blade.php
	const menuItems: NavGroupItem[] = [
		{
			key: "dashboard",
			label: "Dashboard",
			to: "/dashboard",
			icon: LayoutDashboard,
		},
	]

	if (isSuperAdmin || isBendahara) {
		menuItems.push({
			key: "reports",
			label: "Laporan",
			to: "/reports",
			icon: FileText,
		})
	}

	if (isKasir) {
		menuItems.push({
			key: "ewallet",
			label: "Dompet",
			icon: Wallet,
			children: [
				{ to: "/ewallets", label: "Akun Dompet", icon: Wallet },
				{ to: "/ewallet-transactions", label: "Riwayat Transaksi", icon: Receipt },
			],
		})
	}

	if (isSuperOrAdmin) {
		menuItems.push({
			key: "academic",
			label: "Akademik",
			icon: GraduationCap,
			children: [
				{
					key: "academic_santri",
					label: "Santri",
					icon: Users,
					children: [
						{ to: "/students", label: "Data Santri" },
						{ to: "/students/create", label: "Tambah" },
					],
				},
				{
					key: "academic_alumni",
					label: "Alumni",
					icon: Award,
					children: [
						{ to: "/alumni", label: "Data Alumni" },
						{ to: "/alumni/dashboard", label: "Dashboard" },
					],
				},
				{
					key: "academic_psb",
					label: "PSB",
					icon: UserPlus,
					children: [
						{ to: "/registrants", label: "Data PSB" },
						{ to: "/registrants/create", label: "Tambah" },
					],
				},
			],
		})
	}

	if (isBendahara || isSuperOrAdmin) {
		menuItems.push({
			key: "student_payments",
			label: "Pembayaran Santri",
			icon: DollarSign,
			children: [
				{ to: "/student-invoices", label: "Tagihan", icon: Receipt },
				{ to: "/student-capabilities", label: "Kesanggupan", icon: Sliders },
				{ to: "/student-transactions", label: "Riwayat", icon: Receipt },
			],
		})
	}

	// Data Master
	const masterChildren: (NavLeafItem | NavGroupItem)[] = []
	if (isSuperOrAdmin) {
		masterChildren.push({
			key: "master_academic_year",
			label: "Tahun Ajaran",
			icon: Calendar,
			children: [
				{ to: "/academic-years", label: "Semua" },
				{ to: "/academic-years/create", label: "Tambah" },
			],
		})
	}
	if (isSuperAdmin || isBendahara) {
		masterChildren.push({
			key: "master_finance",
			label: "Keuangan",
			icon: DollarSign,
			children: [
				{ to: "/student-costs", label: "Biaya Santri" },
				{ to: "/accountancy", label: "Akun" },
			],
		})
	}
	if (isSuperOrAdmin) {
		masterChildren.push({
			key: "master_academic",
			label: "Akademik",
			icon: BookOpen,
			children: [
				{ to: "/grades", label: "Kelas" },
				{ to: "/majors", label: "Jurusan" },
				{ to: "/levels", label: "Jenjang" },
			],
		})
	}
	if (isSuperOrAdmin || isKasir) {
		masterChildren.push({
			key: "master_merchant",
			label: "Merchant",
			icon: Store,
			children: [
				{ to: "/merchants", label: "Data Merchant" },
				{ to: "/merchants/create", label: "Tambah" },
			],
		})
	}

	if (masterChildren.length > 0) {
		menuItems.push({
			key: "master_data",
			label: "Data Master",
			icon: Layers,
			children: masterChildren,
		})
	}

	// Lainnya
	const otherChildren: (NavLeafItem | NavGroupItem)[] = []
	if (isSuperAdmin) {
		otherChildren.push({
			key: "other_users",
			label: "Pengelola",
			icon: Shield,
			children: [
				{ to: "/users", label: "Semua" },
				{ to: "/users/create", label: "Tambah" },
			],
		})
	}

	const settingsChildren: NavLeafItem[] = []
	if (isSuperOrAdmin) {
		settingsChildren.push(
			{ to: "/settings/announcements", label: "Pengumuman PSB" },
			{ to: "/settings/form", label: "Form Data Santri" },
			{ to: "/settings/school", label: "Profil Pondok" },
		)
	}
	settingsChildren.push({ to: "/my-profile", label: "Profil Saya" })
	if (isSuperAdmin) {
		settingsChildren.push({ to: "/settings", label: "Sistem" })
	}

	otherChildren.push({
		key: "other_settings",
		label: "Pengaturan",
		icon: Settings,
		children: settingsChildren,
	})

	if (isSuperAdmin) {
		otherChildren.push({
			to: "/auth-logs",
			label: "Authentication Log",
			icon: ShieldAlert,
		})
	}

	menuItems.push({
		key: "other",
		label: "Lainnya",
		icon: Settings,
		children: otherChildren,
	})

	const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
		academic: true,
		academic_santri: true,
		academic_alumni: false,
		academic_psb: false,
		student_payments: true,
		master_data: true,
		master_academic_year: false,
		master_finance: false,
		master_academic: false,
		master_merchant: false,
		other: false,
		other_users: false,
		other_settings: false,
	})

	const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)

	const toggleMenu = (key: string) => {
		setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	// Helper to check if any child/descendant matches current path
	const isPathActive = (item: NavLeafItem | NavGroupItem): boolean => {
		if ("to" in item && item.to === currentPath) return true
		if (isGroupItem(item)) {
			return item.children?.some(isPathActive) ?? false
		}
		return false
	}

	// Render Level 2 & 3 navigation items
	const renderSubItems = (items: (NavLeafItem | NavGroupItem)[], depth = 1) => {
		return items.map((child) => {
			if (isGroupItem(child)) {
				const isOpen = Boolean(openMenus[child.key])
				const isActive = isPathActive(child)
				const ChildIcon = child.icon

				return (
					<div key={child.key} className="space-y-1">
						<button
							type="button"
							onClick={() => toggleMenu(child.key)}
							className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
								isActive
									? "text-[var(--primary)] font-semibold"
									: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
							}`}
						>
							<div className="flex items-center gap-2 truncate">
								{ChildIcon ? (
									<ChildIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
								) : (
									<span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
								)}
								<span className="truncate">{child.label}</span>
							</div>
							<ChevronDown
								className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
									isOpen ? "rotate-180 text-[var(--primary)]" : "rotate-0"
								}`}
							/>
						</button>

						{child.children && (
							<div
								className={`grid transition-all duration-200 ease-in-out overflow-hidden ${
									isOpen ? "grid-rows-[1fr] opacity-100 pl-4 border-l border-slate-100 ml-3" : "grid-rows-[0fr] opacity-0"
								}`}
							>
								<div className="min-h-0 space-y-1 pt-1">
									{renderSubItems(child.children, depth + 1)}
								</div>
							</div>
						)}
					</div>
				)
			}

			// Leaf item
			const LeafIcon = child.icon
			return (
				<Link
					key={child.to}
					to={child.to as any}
					onClick={() => mobileOpen && onCloseMobile()}
					className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 transition-all duration-150"
					activeProps={{
						className:
							"flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-white shadow-xs",
					}}
				>
					{LeafIcon ? (
						<LeafIcon className="w-3.5 h-3.5 shrink-0" />
					) : (
						<span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-slate-700 transition-colors shrink-0" />
					)}
					<span className="truncate">{child.label}</span>
				</Link>
			)
		})
	}

	return (
		<>
			{/* Mobile Backdrop */}
			{mobileOpen && (
				<div
					className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
					onClick={onCloseMobile}
					aria-hidden="true"
				/>
			)}

			{/* Sidebar Container */}
			<aside
				className={`fixed lg:sticky top-0 lg:top-[60px] left-0 z-50 lg:z-30 h-screen lg:h-[calc(100vh-60px)] bg-white text-slate-700 transition-all duration-300 ease-in-out flex flex-col shadow-sm shadow-slate-200/60 border-0 ${
					mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
				} ${collapsed ? "lg:w-20" : "lg:w-64"}`}
			>
				{/* Top Branding Section */}
				<div className="h-[60px] flex items-center justify-between px-4 shrink-0 bg-slate-50/60">
					<div className="flex items-center gap-3 overflow-hidden">
						<div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-xs">
							<School className="w-5 h-5" />
						</div>
						{(!collapsed || mobileOpen) && (
							<div className="flex flex-col min-w-0 transition-opacity duration-200">
								<span className="font-bold text-sm tracking-wide text-slate-900 truncate">PONDOK ROJA</span>
								<span className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase truncate">
									Admin Panel
								</span>
							</div>
						)}
					</div>

					{/* Mobile Close Button */}
					<button
						type="button"
						className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
						onClick={onCloseMobile}
						title="Tutup Menu"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Navigation Links Scroll Area */}
				<div className="flex-1 overflow-y-auto overflow-x-visible py-4 px-3 space-y-1.5 custom-scrollbar">
					{menuItems.map((item) => {
						const Icon = item.icon || Layers
						const hasChildren = Boolean(item.children && item.children.length > 0)
						const isActive = isPathActive(item)
						const isOpen = Boolean(openMenus[item.key])
						const isCollapsedRail = collapsed && !mobileOpen

						// Direct Single Link
						if (!hasChildren && item.to) {
							return (
								<div key={item.key}>
									<Link
										to={item.to as any}
										onClick={() => mobileOpen && onCloseMobile()}
										className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200 group"
										activeProps={{
											className:
												"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[var(--primary)] text-white shadow-md shadow-pink-500/20",
										}}
										title={isCollapsedRail ? item.label : undefined}
									>
										<Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
										{!isCollapsedRail && (
											<span className="truncate flex-1 tracking-wide">{item.label}</span>
										)}
									</Link>
								</div>
							)
						}

						// Accordion Group
						return (
							<div
								key={item.key}
								className="relative"
								onMouseEnter={() => isCollapsedRail && setHoveredMenu(item.key)}
								onMouseLeave={() => isCollapsedRail && setHoveredMenu(null)}
							>
								<button
									type="button"
									onClick={() => !isCollapsedRail && toggleMenu(item.key)}
									className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group cursor-pointer ${
										isActive
											? "text-[var(--primary)] bg-pink-50/80 font-semibold"
											: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
									}`}
									title={isCollapsedRail ? item.label : undefined}
								>
									<Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
									{!isCollapsedRail && (
										<>
											<span className="truncate flex-1 text-left tracking-wide">{item.label}</span>
											<ChevronDown
												className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ease-in-out ${
													isOpen ? "rotate-180 text-[var(--primary)]" : "rotate-0"
												}`}
											/>
										</>
									)}
								</button>

								{/* Animated Submenu */}
								{!isCollapsedRail && item.children && (
									<div
										className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
											isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
										}`}
									>
										<div className="min-h-0 pl-4 pr-1 space-y-1">
											{renderSubItems(item.children)}
										</div>
									</div>
								)}

								{/* Collapsed Rail Flyout Menu */}
								{isCollapsedRail && item.children && (
									<div
										className={`absolute left-full top-0 ml-2 w-52 bg-white rounded-2xl shadow-xl py-2 px-2 z-50 transition-all duration-200 ease-out origin-top-left border border-slate-100 ${
											hoveredMenu === item.key
												? "opacity-100 scale-100 pointer-events-auto translate-x-0"
												: "opacity-0 scale-95 pointer-events-none -translate-x-1"
										}`}
									>
										<div className="px-3 py-1.5 text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider border-b border-slate-100 mb-1">
											{item.label}
										</div>
										<div className="space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
											{renderSubItems(item.children)}
										</div>
									</div>
								)}
							</div>
						)
					})}
				</div>

				{/* Desktop Collapse Toggle Footer */}
				<div className="hidden lg:flex items-center justify-between p-3 shrink-0 bg-slate-50/70">
					{!collapsed && (
						<span className="text-[11px] text-slate-400 truncate pl-2 font-medium">Sembunyikan Menu</span>
					)}
					<button
						type="button"
						onClick={onToggleCollapse}
						className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
							collapsed ? "mx-auto" : ""
						}`}
						title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
					>
						{collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
					</button>
				</div>
			</aside>
		</>
	)
}

