import type { JSX } from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { LogIn, LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react"
import useAuthStore from "@/stores/auth.store"
import { psbApi } from "@/lib/api"
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@roja/ui"

export const Header = (): JSX.Element => {
	const auth = useAuthStore()
	const navigate = useNavigate()
	const [isScrolled, setIsScrolled] = useState<boolean>(false)

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
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<button className="flex items-center gap-3 cursor-pointer focus:outline-none py-1.5 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
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
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end" className="w-56 border-l-4 border-l-[var(--primary)] py-2">
							<DropdownMenuItem asChild>
								<Link to="/dashboard" className="flex items-center gap-2 cursor-pointer font-medium text-xs">
									<LayoutDashboard className="w-4 h-4 text-slate-500" />
									<span>Dashboard</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/settings" className="flex items-center gap-2 cursor-pointer font-medium text-xs">
									<Settings className="w-4 h-4 text-slate-500" />
									<span>Pengaturan</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleLogout}
								className="flex items-center gap-2 text-xs text-[var(--danger)] focus:text-[var(--danger)] cursor-pointer font-medium"
							>
								<LogOut className="w-4 h-4 text-[var(--danger)]" />
								<span>Keluar dari aplikasi</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Button asChild variant="roja-primary" size="sm">
						<Link to="/login" className="flex items-center gap-2 text-xs font-semibold px-5">
							<LogIn className="w-4 h-4" />
							<span>Login</span>
						</Link>
					</Button>
				)}
			</div>
		</header>
	)
}

export default Header

