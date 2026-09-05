import type { JSX } from "react"
import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import { ShieldCheck, ChevronDown, LogOut } from "lucide-react"

export const Header = (): JSX.Element => {
	const navigate = useNavigate()
	const { user, logout } = useAuthStore()
	const [dropdownOpen, setDropdownOpen] = useState(false)

	const formatDate = (): string => {
		const now = new Date()
		const options: Intl.DateTimeFormatOptions = {
			weekday: "long",
			day: "2-digit",
			month: "long",
			year: "numeric",
		}
		return now.toLocaleDateString("id-ID", options)
	}

	const handleLogout = () => {
		logout()
		navigate({ to: "/login" })
	}

	return (
		<header className="bg-white dark:bg-[#17283c] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Brand Logo */}
					<div className="flex items-center gap-3">
						<Link to="/" className="flex items-center gap-2.5">
							<div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-md shadow-[var(--primary)]/20">
								<ShieldCheck className="w-5 h-5 text-white" />
							</div>
							<div className="flex flex-col">
								<span className="font-bold text-base text-slate-800 dark:text-white font-sans tracking-tight">
									Pondok Roja
								</span>
								<span className="text-[10px] font-semibold text-[var(--secondary)] tracking-widest uppercase">
									Portal Santri
								</span>
							</div>
						</Link>
					</div>

					{/* Date Display */}
					<div className="hidden md:flex items-center text-xs font-medium text-[var(--body-txt-inverse)] tracking-wide">
						<span>{formatDate()}</span>
					</div>

					{/* User Profile Dropdown */}
					<div className="relative">
						<button
							onClick={() => setDropdownOpen(!dropdownOpen)}
							className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
						>
							<div className="flex flex-col text-right">
								<span className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[140px]">
									{user?.name || "Ahmad Mujtaba"}
								</span>
								<span className="text-[10px] font-medium text-[var(--muted-txt-color)]">
									Santri
								</span>
							</div>
							<div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold shrink-0 border border-[var(--primary)]/20">
								{user?.name ? user.name.substring(0, 2).toUpperCase() : "SA"}
							</div>
							<ChevronDown className="w-4 h-4 text-slate-400" />
						</button>

						{/* Dropdown Menu */}
						{dropdownOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#17283c] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95">
								<button
									onClick={handleLogout}
									className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-full text-left transition-colors cursor-pointer"
								>
									<LogOut className="w-4 h-4" />
									<span>Keluar dari aplikasi</span>
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header
