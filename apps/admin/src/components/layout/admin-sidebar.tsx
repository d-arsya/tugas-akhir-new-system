import { useMemo, useState, type JSX } from "react"
import { useRouterState } from "@tanstack/react-router"

import { cn } from "@roja/utils"

import { useIsDesktop } from "@/hooks/use-media-query"
import { usePersistedScroll } from "@/hooks/use-persisted-scroll"
import { useSidebarNav } from "@/hooks/use-sidebar-nav"
import type { LayoutRole } from "@/lib/admin-roles"

import { filterMenuByRole, SIDEBAR_MENU } from "./sidebar-menu"
import SidebarNavItem, { type SidebarNavState } from "./sidebar-nav-item"

type AdminSidebarProps = {
	role: LayoutRole | null
	collapsed: boolean
	onToggleCollapse: () => void
	mobileOpen: boolean
	badges: SidebarNavState["badges"]
}

const HamburgerIcon = (): JSX.Element => (
	<span className="block w-[14px]">
		<span className="mb-[3px] block h-[2px] w-full bg-white" />
		<span className="mb-[3px] block h-[2px] w-full bg-white" />
		<span className="block h-[2px] w-full bg-white" />
	</span>
)

const AdminSidebar = ({
	role,
	collapsed,
	onToggleCollapse,
	mobileOpen,
	badges,
}: AdminSidebarProps): JSX.Element => {
	const pathname = useRouterState({ select: (state) => state.location.pathname })
	const isDesktop = useIsDesktop()
	const [hovered, setHovered] = useState(false)
	const items = useMemo(() => filterMenuByRole(SIDEBAR_MENU, role), [role])
	const { activeChain, openMap, toggle } = useSidebarNav(items, pathname)
	const scroll = usePersistedScroll<HTMLDivElement>("sidebar-left-position")

	const isCollapsed = isDesktop && collapsed
	const nav: SidebarNavState = {
		activeChain,
		openMap,
		toggle,
		compact: isCollapsed && !hovered,
		badges,
	}

	return (
		<aside
			className={cn(
				"fixed inset-0 z-[1002] w-screen bg-[#17283C] pt-[60px] text-[12px] text-[#777] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)] transition-transform duration-[250ms] ease-out",
				mobileOpen ? "translate-x-0" : "-translate-x-full",
				"md:top-[60px] md:right-auto md:bottom-0 md:z-[1010] md:translate-x-0 md:pt-0 md:transition-[width] md:duration-300",
				isCollapsed ? "md:w-[73px]" : "md:w-[250px]",
			)}
		>
			<div className="relative h-[50px] overflow-hidden text-[#777]">
				<div
					className={cn(
						"bg-[#17283C] py-[15px] pr-[15px] pl-[25px] text-[0.8rem] font-normal tracking-[0.5px] text-white/[0.26] transition-all duration-300",
						isCollapsed && "-ml-[250px] opacity-0",
					)}
				>
					Navigation
				</div>
				<button
					type="button"
					aria-label="Toggle sidebar"
					onClick={onToggleCollapse}
					className={cn(
						"absolute top-0 right-0 hidden h-[50px] w-[73px] cursor-pointer items-center justify-around bg-[#111E2C] md:flex",
						isCollapsed ? "rounded-none" : "rounded-[8px_0_0_8px]",
					)}
				>
					<HamburgerIcon />
				</button>
			</div>

			<div
				ref={scroll.ref}
				onScroll={scroll.onScroll}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				className={cn(
					"relative h-[calc(100%-50px)] w-full overflow-x-hidden overflow-y-auto bg-[#17283C] shadow-[inset_-5px_0_0_#17283C] transition-all duration-300 [scrollbar-width:none] md:h-[calc(100%-52px)] [&::-webkit-scrollbar]:hidden",
					isCollapsed && hovered && "md:h-[calc(100%-50px)] md:w-[250px] md:shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]",
				)}
			>
				<nav className="px-[12px] pt-[24px] pb-[50px]" role="navigation">
					<ul>
						{items.map((item) => (
							<SidebarNavItem key={item.key} item={item} parentKey="root" depth={0} nav={nav} />
						))}
					</ul>
				</nav>
			</div>
		</aside>
	)
}

export default AdminSidebar
