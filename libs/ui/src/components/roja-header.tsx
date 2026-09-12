import type { JSX, ReactNode } from "react"
import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { LogIn, LogOut, Settings, LayoutDashboard, ChevronDown, User, ClipboardList, Wallet } from "lucide-react"
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

const getRoleMenuItems = (roleLabel: string): RojaHeaderMenuItem[] => {
	const normalized = roleLabel.toUpperCase()
	if (normalized === "SANTRI") {
		return [
			{
				label: "Dashboard",
				href: "/dashboard",
				icon: <LayoutDashboard className="w-4 h-4 text-[#e4007e]" />,
			},
			{
				label: "Pembayaran Santri",
				href: "/payment-history",
				icon: <ClipboardList className="w-4 h-4 text-[#e4007e]" />,
			},
			{
				label: "Dompet Digital",
				href: "/e-wallet",
				icon: <Wallet className="w-4 h-4 text-[#6866e9]" />,
			},
			{
				label: "Profil Saya",
				href: "/profile",
				icon: <User className="w-4 h-4 text-[#ffa800]" />,
			},
			{
				label: "Pengaturan",
				href: "/setting",
				icon: <Settings className="w-4 h-4 text-[#8dc31e]" />,
			},
		]
	}

	if (normalized === "MERCHANT") {
		return [
			{
				label: "Profil Saya",
				href: "/profile",
				icon: <User className="w-4 h-4 text-[#ffa800]" />,
			},
			{
				label: "Pengaturan",
				href: "/setting",
				icon: <Settings className="w-4 h-4 text-[#8dc31e]" />,
			},
			{
				label: "Dompet Digital",
				href: "/e-wallet",
				icon: <Wallet className="w-4 h-4 text-[#6866e9]" />,
			},
		]
	}

	if (normalized === "PENDAFTAR" || normalized === "PSB") {
		return [
			{
				label: "Dashboard",
				href: "/dashboard",
				icon: <LayoutDashboard className="w-4 h-4 text-[#e4007e]" />,
			},
			{
				label: "Pengaturan Akun",
				href: "/settings",
				icon: <Settings className="w-4 h-4 text-[#8dc31e]" />,
			},
		]
	}

	return [
		{
			label: "Dashboard",
			href: "/dashboard",
			icon: <LayoutDashboard className="w-4 h-4 text-[#e4007e]" />,
		},
		{
			label: "Pengaturan",
			href: "/settings",
			icon: <Settings className="w-4 h-4 text-[#8dc31e]" />,
		},
	]
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
	const resolvedHomeHref = homeHref || (isAuthenticated ? (roleLabel.toUpperCase() === "MERCHANT" ? "/profile" : "/dashboard") : (roleLabel.toUpperCase() === "PENDAFTAR" ? "/" : "/login"))

	const activeMenuItems = menuItems || getRoleMenuItems(roleLabel)

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
			<div className="hidden sm:flex items-center justify-center pointer-events-none select-none">
				<span className="roja_header_date px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide shadow-xs">
					{todayFormatted}
				</span>
			</div>

			{/* Right Section: Profile Dropdown or Login Button */}
			<div className="flex items-center">
				{isAuthenticated ? (
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<button className="flex items-center gap-3 cursor-pointer focus:outline-none py-1.5 px-3 rounded-xl hover:bg-black/5 transition-all">
								<div className="flex flex-col text-right">
									<span
										className={`text-xs font-semibold max-w-[150px] md:max-w-[200px] truncate transition-colors duration-300 ${
											isScrolled ?"text-white":"text-slate-700"
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
									className={`w-4 h-4 transition-colors duration-300 ${
										isScrolled ? "text-white" : "text-[var(--primary)]"
									}`}
								/>
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							align="end"
							sideOffset={14}
							className="w-64 bg-white/95 backdrop-blur-xl opacity-100 border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 flex flex-col gap-1 z-[99999]"
						>
							{/* User Info Header in Dropdown */}
							<div className="px-3 py-2.5 bg-slate-50/90 rounded-xl mb-1 flex items-center gap-3 border border-slate-100">
								<div className="w-8 h-8 rounded-lg bg-[#e4007e]/10 text-[#e4007e] flex items-center justify-center shrink-0">
									<User className="w-4 h-4" />
								</div>
								<div className="flex flex-col min-w-0">
									<span className="text-xs font-bold text-slate-800 truncate">
										{userDisplayName}
									</span>
									<span className="text-[10px] font-bold text-[#8dc31e] tracking-wider uppercase">
										{roleLabel}
									</span>
								</div>
							</div>

							{activeMenuItems.map((item, idx) => (
								<DropdownMenuItem key={idx} asChild={!!item.href} onClick={item.onClick} className="rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer">
									{item.href ? (
										<Link
											to={item.href as any}
											className="flex items-center gap-2.5 cursor-pointer font-medium text-xs text-slate-700 outline-none focus:outline-none focus-visible:outline-none ring-0 border-0 w-full"
										>
											{item.icon}
											<span>{item.label}</span>
										</Link>
									) : (
										<div className="flex items-center gap-2.5 cursor-pointer font-medium text-xs text-slate-700 outline-none border-0 w-full">
											{item.icon}
											<span>{item.label}</span>
										</div>
									)}
								</DropdownMenuItem>
							))}

							{onLogout && (
								<>
									<DropdownMenuSeparator className="my-1 border-t border-slate-100"/>
									<DropdownMenuItem
										onClick={onLogout}
										className="flex items-center gap-2.5 text-xs text-[#f8374b] hover:bg-rose-50 cursor-pointer font-semibold rounded-xl px-3 py-2 transition-colors border-0 outline-none"
									>
										<LogOut className="w-4 h-4 text-[#f8374b]" />
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
