import type { JSX, ReactNode } from "react"
import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { LogIn, LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react"
import { Button } from "./ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export interface RojaHeaderMenuItem {
	label: string
	href?: string
	icon?: ReactNode
	onClick?: () => void
	isDanger?: boolean
}

export interface RojaHeaderProps {
	user?: { name?: string; fullname?: string; email?: string } | null
	roleLabel?: string
	isAuthenticated?: boolean
	homeHref?: string
	loginHref?: string
	logoSrc?: string
	logoLightSrc?: string
	menuItems?: RojaHeaderMenuItem[]
	onLogout?: () => void | Promise<void>
	className?: string
}

export const RojaHeader = ({
	user,
	roleLabel = "USER",
	isAuthenticated = false,
	homeHref,
	loginHref = "/login",
	logoSrc = "/assets/svg/etc/Logo.svg",
	logoLightSrc = "/assets/svg/etc/Logo-Light.svg",
	menuItems,
	onLogout,
	className = "",
}: RojaHeaderProps): JSX.Element => {
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

		handleScroll()

		return () => {
			window.removeEventListener("scroll", handleScroll)
			document.removeEventListener("scroll", handleScroll)
		}
	}, [])

	const userDisplayName = user?.name || user?.fullname || user?.email || "Account"
	const resolvedHomeHref = homeHref || (isAuthenticated ? "/dashboard" : "/")

	const defaultMenuItems: RojaHeaderMenuItem[] = [
		{
			label: "Dashboard",
			href: "/dashboard",
			icon: <LayoutDashboard className="w-4 h-4 text-slate-500" />,
		},
		{
			label: "Pengaturan",
			href: roleLabel === "SANTRI" ? "/setting" : "/settings",
			icon: <Settings className="w-4 h-4 text-slate-500" />,
		},
	]

	const activeMenuItems = menuItems || defaultMenuItems

	return (
		<header className={`roja_header ${isScrolled ? "scrolled" : ""} ${className}`}>
			{/* Left Logo */}
			<div className="flex items-center">
				<Link to={resolvedHomeHref as any}>
					<img
						src={isScrolled ? logoLightSrc : logoSrc}
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
				{isAuthenticated ? (
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<button className="flex items-center gap-3 cursor-pointer focus:outline-none py-1.5 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
								<div className="flex flex-col text-right">
									<span
										className={`text-xs font-semibold max-w-[150px] md:max-w-[200px] truncate transition-colors duration-300 ${
											isScrolled ? "text-white" : "text-slate-700 dark:text-slate-200"
										}`}
									>
										{userDisplayName}
									</span>
									<span
										className={`text-[9px] font-bold tracking-wider text-right transition-colors duration-300 ${
											isScrolled ? "text-white/70" : "text-[#abb4be]"
										}`}
									>
										{roleLabel}
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
							{activeMenuItems.map((item, idx) => (
								<DropdownMenuItem key={idx} asChild={!!item.href} onClick={item.onClick}>
									{item.href ? (
										<Link
											to={item.href as any}
											className="flex items-center gap-2 cursor-pointer font-medium text-xs"
										>
											{item.icon}
											<span>{item.label}</span>
										</Link>
									) : (
										<div className="flex items-center gap-2 cursor-pointer font-medium text-xs">
											{item.icon}
											<span>{item.label}</span>
										</div>
									)}
								</DropdownMenuItem>
							))}

							{onLogout && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={onLogout}
										className="flex items-center gap-2 text-xs text-[var(--danger)] focus:text-[var(--danger)] cursor-pointer font-medium"
									>
										<LogOut className="w-4 h-4 text-[var(--danger)]" />
										<span>Keluar dari aplikasi</span>
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Button asChild variant="roja-primary" size="sm" className="roja_header_login">
						<Link to={loginHref as any} className="flex items-center gap-2 text-xs font-semibold px-5">
							<LogIn className="w-4 h-4" />
							<span>Login</span>
						</Link>
					</Button>
				)}
			</div>
		</header>
	)
}

export default RojaHeader
