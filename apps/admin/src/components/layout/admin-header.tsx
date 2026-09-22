import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@roja/ui"

import { useIsDesktop } from "@/hooks/use-media-query"

import { ArrowDownIcon, BarsIcon, GearIcon, LogoutIcon, UserIcon } from "./sidebar-icons"

type AdminHeaderProps = {
	userName: string
	roleLabel: string
	onToggleMobileSidebar: () => void
	onLogout: () => void
}

const LOGO_SRC = "/assets/images/Logo.png"

const MENU_ITEM_CLASS =
	"relative flex items-center justify-start gap-0 rounded-[6px] bg-transparent px-[16px] py-[10px] text-[12px] leading-[1.3rem] font-normal tracking-[1px] text-white transition-all duration-500 hover:bg-[rgba(17,30,44,0.6)] focus:bg-[rgba(17,30,44,0.6)] focus:text-white [&_svg]:mr-[12px] [&_svg]:size-auto [&_svg]:w-[24px] [&_svg]:min-w-[24px]"

// Legacy Str::words($name, 2, '')
const firstTwoWords = (name: string): string => name.trim().split(/\s+/).slice(0, 2).join(" ")

const UserboxMenuLink = ({ to, icon, label }: { to: "/settings" | "/my-profile"; icon: ReactNode; label: string }): JSX.Element => (
	<DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
		<Link to={to}>
			{icon}
			{label}
		</Link>
	</DropdownMenuItem>
)

// Port of legacy header.blade.php (logo + userbox dropdown)
const AdminHeader = ({ userName, roleLabel, onToggleMobileSidebar, onLogout }: AdminHeaderProps): JSX.Element => {
	const isDesktop = useIsDesktop()

	// Legacy borders are drawn as padding/inset shadow: globals.css forces border-color on every element
	return (
		<header className="static z-[1000] h-auto bg-[#17283C] pt-[3px] md:fixed md:top-0 md:right-0 md:left-0 md:z-[1020] md:h-[60px]">
			<div className="fixed top-0 right-0 left-0 z-[1003] h-[60px] bg-[#17283C] pt-[3px] pb-[1px] shadow-[inset_0_-1px_0_rgba(17,30,44,0.5)] md:static md:h-auto md:bg-transparent md:p-0 md:shadow-none">
				<Link
					to="/"
					className="relative inline-block px-[25px] leading-[57px] md:float-left md:m-0 md:leading-[1.4rem]"
				>
					<img
						src={LOGO_SRC}
						alt="Pondok Roja"
						className="relative -mt-[6px] inline-block h-[42px] w-auto md:mt-[6px]"
					/>
				</Link>
				<button
					type="button"
					aria-label="Toggle sidebar"
					onClick={onToggleMobileSidebar}
					className="absolute top-[16px] right-[15px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-[var(--secondary)] text-[12px] font-normal text-white md:hidden"
				>
					<BarsIcon />
				</button>
			</div>

			<div className="mt-[60px] h-[60px] w-full bg-[#17283C] md:float-right md:mt-0 md:h-[56px] md:w-auto md:bg-transparent">
				<DropdownMenu modal={false}>
					<div className="relative float-left mt-0 mr-[30px] ml-[12px] h-[57px] w-[180px] align-middle md:float-none md:ml-0 md:inline-block">
						<DropdownMenuTrigger asChild>
							<button type="button" className="group/trigger relative block w-full cursor-pointer text-left outline-none">
								<span className="m-0 block w-full pt-[11px] pr-0 pb-[12px] pl-[2px]">
									<span className="mt-0 mb-[4px] block w-[138px] overflow-hidden text-[0.8rem] leading-[1.1rem] text-ellipsis whitespace-nowrap text-[#EEEEEE]">
										{firstTwoWords(userName)}
									</span>
									<span className="block text-[0.7rem] leading-[0.7rem] text-[#ACACAC]">{roleLabel}</span>
								</span>
								<span className="absolute top-[calc(50%-12px)] right-0 flex h-[18px] w-[18px] items-center justify-center text-[14px] text-[#FF008D] transition-all duration-500 group-data-[state=open]/trigger:rotate-180">
									<ArrowDownIcon />
								</span>
							</button>
						</DropdownMenuTrigger>
					</div>

					<DropdownMenuContent
						align="start"
						sideOffset={isDesktop ? 7 : 10}
						className="z-[10016] w-[180px] min-w-0 overflow-hidden rounded-[12px] border-0 bg-[#17283C] px-0 py-[12px] text-white shadow-[0px_3px_16px_0px_rgba(0,0,0,0.08)] data-[state=closed]:animate-none data-[state=open]:animate-none"
					>
						<div className="px-[12px]">
							<UserboxMenuLink to="/settings" icon={<GearIcon />} label="Pengaturan" />
							<UserboxMenuLink to="/my-profile" icon={<UserIcon />} label="Profil Saya" />
							<DropdownMenuItem className={MENU_ITEM_CLASS} onSelect={onLogout}>
								<LogoutIcon />
								Keluar
							</DropdownMenuItem>
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	)
}

export default AdminHeader
