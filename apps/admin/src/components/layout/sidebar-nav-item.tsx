import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@roja/utils"

import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import { ArrowDownIcon, SIDEBAR_ICONS } from "./sidebar-icons"
import type { SidebarMenuItem } from "./sidebar-menu"

export type SidebarNavState = {
	activeChain: string[]
	// parent key ("root" for top level) → key of its currently expanded child
	openMap: Record<string, string | null>
	toggle: (parentKey: string, key: string) => void
	// Desktop collapsed sidebar that is not hovered: icons only
	compact: boolean
	badges: Partial<Record<NonNullable<SidebarMenuItem["badge"]>, number>>
}

type SidebarNavItemProps = {
	item: SidebarMenuItem
	parentKey: string
	depth: number
	nav: SidebarNavState
}

const CIRCLE_BULLET = "/assets/svg/icons/menu/circle.svg"

const TOP_LINK_CLASS =
	"group/link block w-full cursor-pointer rounded-[8px] py-[12px] text-left font-normal whitespace-nowrap text-white transition-all duration-500 hover:bg-[var(--primary)] hover:shadow-[0px_8px_10px_rgba(228,0,126,0.25)] focus-visible:bg-[var(--primary)] focus-visible:outline-none data-[highlight=true]:bg-[var(--primary)] data-[highlight=true]:shadow-[0px_8px_10px_rgba(228,0,126,0.25)]"

// Child rows: a 5px primary bar slides in from the left edge (clipped by overflow-hidden)
const CHILD_LINK_CLASS =
	"group/link relative flex w-full cursor-pointer items-center justify-start overflow-hidden bg-transparent pr-[16px] text-left whitespace-nowrap text-white transition-all duration-500 before:absolute before:left-[-5px] before:w-[5px] before:bg-[var(--primary)] before:transition-all before:duration-200 before:content-[''] hover:before:left-0 data-[highlight=true]:before:left-0"

const CHILD_DEPTH_CLASS: Record<number, string> = {
	1: "py-[12px] pl-[25px] before:top-[6px] before:h-[34px]",
	2: "py-[8px] pl-[53px] before:top-[8px] before:h-[22px]",
}

const SidebarNavItem = ({ item, parentKey, depth, nav }: SidebarNavItemProps): JSX.Element => {
	const isParent = Boolean(item.children?.length)
	const isOpen = isParent && nav.openMap[parentKey] === item.key
	const isActive = !isParent && nav.activeChain[nav.activeChain.length - 1] === item.key
	const isTop = depth === 0
	const compact = nav.compact && isTop
	const Icon = item.icon ? SIDEBAR_ICONS[item.icon] : null
	const badgeCount = item.badge ? (nav.badges[item.badge] ?? 0) : 0

	const linkClass = isTop
		? cn(TOP_LINK_CLASS, RIPPLE_CLASS, compact ? "px-[13px]" : "px-[20px]")
		: cn(CHILD_LINK_CLASS, CHILD_DEPTH_CLASS[depth] ?? CHILD_DEPTH_CLASS[2])

	const content = (
		<>
			{/* Legacy markup has whitespace between the icon and label; inside a block link it renders as a gap */}
			{Icon ? (
				<>
					<Icon className="mr-[12px]" />{" "}
				</>
			) : null}
			{!isTop ? <img src={CIRCLE_BULLET} alt="Arrow" className="mr-[10px]" /> : null}
			<span className={cn("align-middle tracking-[0.5px]", compact && "invisible")}>{item.label}</span>
			{badgeCount > 0 ? (
				<span className="absolute top-[11px] right-[5px] flex h-[24px] w-[24px] items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] font-bold text-white">
					{badgeCount}
				</span>
			) : null}
			{isParent && !compact ? (
				<span
					className={cn(
						"absolute top-0 right-0 flex h-full items-center justify-center px-[20px] leading-none text-white transition-all duration-500",
						isOpen && "rotate-180",
					)}
				>
					<ArrowDownIcon />
				</span>
			) : null}
		</>
	)

	return (
		<li className={cn("relative w-full", isTop && "mb-[6px]")}>
			{isParent ? (
				<button
					type="button"
					data-highlight={isOpen}
					className={cn(linkClass, "relative")}
					onClick={(event) => {
						if (isTop) triggerRipple(event)
						nav.toggle(parentKey, item.key)
					}}
				>
					{content}
				</button>
			) : item.to ? (
				<Link
					to={item.to}
					data-highlight={isActive}
					className={linkClass}
					onClick={isTop ? triggerRipple : undefined}
				>
					{content}
				</Link>
			) : null}

			{isParent && !compact ? (
				<div
					className={cn(
						"grid transition-[grid-template-rows] duration-200 ease-in-out",
						isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
					)}
				>
					<div className="min-h-0 overflow-hidden">
						<ul
							className={cn(
								"rounded-[10px] bg-[#111E2C]",
								isTop ? "mt-[10px] mb-[4px] py-[14px]" : "my-[10px] py-0",
							)}
						>
							{item.children?.map((child) => (
								<SidebarNavItem key={child.key} item={child} parentKey={item.key} depth={depth + 1} nav={nav} />
							))}
						</ul>
					</div>
				</div>
			) : null}
		</li>
	)
}

export default SidebarNavItem
