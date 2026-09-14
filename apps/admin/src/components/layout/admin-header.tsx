import { useEffect, type JSX } from "react"
import { Link } from "@tanstack/react-router"
import type { AuthUser } from "@roja/types"
import {
	Menu,
	User,
	Settings,
	LogOut,
	ChevronDown,
	CalendarCheck,
	Shield,
} from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@roja/ui"

export interface AdminHeaderProps {
	user: AuthUser | null
	userRole: string
	onToggleSidebar: () => void
	onOpenMobileSidebar: () => void
	onLogout: () => void
}

export function AdminHeader({
	user,
	userRole,
	onToggleSidebar,
	onOpenMobileSidebar,
	onLogout,
}: AdminHeaderProps): JSX.Element {
	useEffect(() => {
		if (typeof window !== "undefined") {
			document.documentElement.removeAttribute("data-theme")
			document.documentElement.classList.remove("dark")
			localStorage.removeItem("roja_theme")
		}
	}, [])

	return (
		<header className="sticky top-0 z-30 h-[60px] bg-white text-slate-800 px-4 lg:px-6 flex items-center justify-between shadow-xs transition-colors duration-200">
			{/* Left Section: Sidebar Toggles & Context Badges */}
			<div className="flex items-center gap-3">
				{/* Mobile Hamburger Button */}
				<button
					type="button"
					onClick={onOpenMobileSidebar}
					className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer transition-colors"
					title="Buka Menu"
				>
					<Menu className="w-5 h-5" />
				</button>

				{/* Desktop Toggle Button */}
				<button
					type="button"
					onClick={onToggleSidebar}
					className="hidden lg:flex p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
					title="Toggle Sidebar"
				>
					<Menu className="w-5 h-5" />
				</button>

				{/* Academic Context Badge */}
				<div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
					<CalendarCheck className="w-3.5 h-3.5" />
					<span>TA: 2024/2025</span>
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
					<span className="text-[10px] uppercase font-bold tracking-wider">Aktif</span>
				</div>
			</div>

			{/* Right Section: Profile Dropdown */}
			<div className="flex items-center gap-2 sm:gap-3">
				{/* User Profile Dropdown */}
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="group flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none data-[state=open]:bg-slate-100"
						>
							<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-[var(--primary)] text-white font-bold text-xs flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105">
								{user?.name?.charAt(0)?.toUpperCase() || "A"}
							</div>
							<div className="hidden md:flex flex-col text-left">
								<span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
									{user?.name || "Administrator"}
								</span>
								<div className="flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">
									<Shield className="w-2.5 h-2.5" />
									<span>{userRole}</span>
								</div>
							</div>
							<ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block transition-transform duration-300 group-data-[state=open]:rotate-180" />
						</button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="end"
						sideOffset={8}
						className="w-56 bg-white text-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-2 flex flex-col gap-1 z-[99999] border-0 outline-none"
					>
						<div className="px-3 py-2 bg-slate-50 rounded-xl mb-1 flex items-center gap-2.5">
							<div className="w-7 h-7 rounded-lg bg-[#e4007e]/10 text-[var(--primary)] flex items-center justify-center shrink-0 font-bold text-xs">
								{user?.name?.charAt(0)?.toUpperCase() || "A"}
							</div>
							<div className="flex flex-col min-w-0">
								<p className="text-xs font-semibold text-slate-900 truncate">
									{user?.name || "Administrator"}
								</p>
								<p className="text-[10px] text-slate-500 truncate">
									{user?.email || "admin@pondokroja.com"}
								</p>
							</div>
						</div>

						<DropdownMenuItem asChild className="rounded-xl px-3 py-2 hover:bg-slate-100 transition-all duration-150 cursor-pointer">
							<Link
								to="/my-profile"
								className="flex items-center gap-2.5 font-medium text-xs text-slate-700 outline-none border-0 w-full"
							>
								<User className="w-4 h-4 text-indigo-500" />
								<span>Profil Saya</span>
							</Link>
						</DropdownMenuItem>

						<DropdownMenuItem asChild className="rounded-xl px-3 py-2 hover:bg-slate-100 transition-all duration-150 cursor-pointer">
							<Link
								to="/settings"
								className="flex items-center gap-2.5 font-medium text-xs text-slate-700 outline-none border-0 w-full"
							>
								<Settings className="w-4 h-4 text-slate-500" />
								<span>Pengaturan Sistem</span>
							</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator className="my-1 border-t border-slate-100" />

						<DropdownMenuItem
							onClick={onLogout}
							className="flex items-center gap-2.5 text-xs text-red-600 hover:bg-red-50 cursor-pointer font-semibold rounded-xl px-3 py-2 transition-all duration-150 border-0 outline-none"
						>
							<LogOut className="w-4 h-4 text-red-600" />
							<span>Keluar (Logout)</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	)
}
