import type { JSX } from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { LogIn, LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react"
import useAuthStore from "@/stores/auth.store"
import { psbApi } from "@/lib/api"

export const Header = (): JSX.Element => {
	const auth = useAuthStore()
	const navigate = useNavigate()
	const [isScrolled, setIsScrolled] = useState<boolean>(false)
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const todayFormatted = new Date().toLocaleDateString("id-ID", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	})

	useEffect(() => {
		const handleScroll = (): void => {
			const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
			if (scrollTop > 10) {
				setIsScrolled(true)
			} else {
				setIsScrolled(false)
			}
		}

		window.addEventListener("scroll", handleScroll, { passive: true })
		document.addEventListener("scroll", handleScroll, { passive: true })
		
		// Initial check
		handleScroll()

		return () => {
			window.removeEventListener("scroll", handleScroll)
			document.removeEventListener("scroll", handleScroll)
		}
	}, [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent): void => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false)
			}
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	const handleLogout = async (): Promise<void> => {
		await psbApi.logout()
		auth.logout()
		navigate({ to: "/login" })
	}

	const userDisplayName = auth.user?.name || auth.user?.fullname || auth.user?.email || ""
	const shouldShowProfile = auth.isAuthenticated

	return (
		<header className={`roja_header ${isScrolled ? "scrolled" : ""}`}>
			{/* Left Logo */}
			<div className="flex items-center">
				<Link to={shouldShowProfile ? "/dashboard" : "/"}>
					<img
						src={isScrolled ? "/assets/svg/etc/Logo-Light.svg" : "/assets/svg/etc/Logo.svg"}
						alt="Pondok Roja"
						className="h-10 w-auto transition-opacity duration-300"
					/>
				</Link>
			</div>

			{/* Center Date Badge */}
			<div className="hidden md:flex items-center justify-center">
				<span className="roja_header_date px-5 py-2 rounded-lg text-xs font-medium tracking-wide border border-transparent">
					{todayFormatted}
				</span>
			</div>

			{/* Right Section: Profile Dropdown or Login Button */}
			<div className="flex items-center">
				{shouldShowProfile ? (
					<div className="relative" ref={dropdownRef}>
						<button
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							className="flex items-center gap-3 cursor-pointer focus:outline-none py-1.5 roja_btn"
						>
							<div className="flex flex-col text-right">
								<span
									className={`text-xs font-semibold max-w-[150px] md:max-w-[200px] truncate transition-colors duration-300 ${
										isScrolled ? "text-white" : "text-slate-700"
									}`}
								>
									{userDisplayName}
								</span>
								<span
									className={`text-[9px] font-bold tracking-wider text-right transition-colors duration-300 ${
										isScrolled ? "text-white/70" : "text-[#abb4be]"
									}`}
								>
									PENDAFTAR
								</span>
							</div>
							<ChevronDown
								className={`w-5 h-5 transition-colors duration-300 ${
									isScrolled ? "text-white" : "text-[var(--primary)]"
								}`}
							/>
						</button>

						{/* Dropdown Panel */}
						{isDropdownOpen && (
							<div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-2 border-l-4 border-l-[var(--primary)]">
								<Link
									to="/dashboard"
									onClick={() => setIsDropdownOpen(false)}
									className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors font-medium"
								>
									<LayoutDashboard className="w-4 h-4 text-slate-500" />
									<span>Dashboard</span>
								</Link>
								<Link
									to="/settings"
									onClick={() => setIsDropdownOpen(false)}
									className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors font-medium"
								>
									<Settings className="w-4 h-4 text-slate-500" />
									<span>Pengaturan</span>
								</Link>
								<hr className="border-slate-100 my-1.5" />
								<button
									onClick={() => {
										setIsDropdownOpen(false)
										handleLogout()
									}}
									className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[var(--danger)] hover:bg-red-50/50 transition-colors font-medium text-left"
								>
									<LogOut className="w-4 h-4 text-[var(--danger)]" />
									<span>Keluar dari aplikasi</span>
								</button>
							</div>
						)}
					</div>
				) : (
					<Link
						to="/login"
						className={`roja_btn roja_header_login flex items-center gap-2 text-xs font-semibold px-5 rounded-lg text-white`}
					>
						<LogIn className="w-4 h-4" />
						<span>Login</span>
					</Link>
				)}
			</div>
		</header>
	)
}

export default Header
