import type { JSX, MouseEvent, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@roja/utils"

import type { SidebarRoutePath } from "@/components/layout/sidebar-menu"

const ITEM_CLASS =
	"group mb-[2px] flex h-[42px] min-h-[42px] w-[42px] min-w-[42px] items-center justify-center overflow-hidden rounded-l-[6px] bg-white shadow-[0_4px_12px_0_rgba(82,63,105,0.06)]"

const LINK_CLASS = {
	orange: "bg-[rgba(255,168,0,0.1)] hover:bg-[var(--warning)]",
	info: "bg-[rgba(104,102,233,0.1)] hover:bg-[var(--info)]",
} as const

const ICON_CLASS =
	"[&>g]:opacity-50 [&>g]:transition-all [&>g]:duration-500 group-hover:[&>g]:opacity-100 [&_path]:transition-all [&_path]:duration-500 group-hover:[&_path]:fill-white"

const linkClass = (color: keyof typeof LINK_CLASS): string =>
	cn("flex h-[33px] w-[33px] items-center justify-center rounded-[5px] transition-all duration-500", LINK_CLASS[color])

export const RefreshIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={ICON_CLASS}>
		<g>
			<rect width="24" height="24" fill="#ffa800" opacity="0" />
			<path
				d="M3.742,13.43a1,1,0,0,1,1.252.65A7.151,7.151,0,0,0,11.876,19a7.106,7.106,0,0,0,7.192-7,7.106,7.106,0,0,0-7.192-7A7.279,7.279,0,0,0,7.218,6.67l2.174-.36a1,1,0,1,1,.321,1.98l-4.247.7h-.17a1,1,0,0,1-.341-.06.331.331,0,0,1-.1-.06.782.782,0,0,1-.2-.11l-.09-.11c0-.05-.09-.09-.13-.15s0-.1-.05-.14a1.339,1.339,0,0,1-.07-.18l-.751-4a1.019,1.019,0,0,1,2-.38l.27,1.45A9.234,9.234,0,0,1,11.876,3a9.108,9.108,0,0,1,9.195,9,9.108,9.108,0,0,1-9.195,9,9.134,9.134,0,0,1-8.834-6.32,1,1,0,0,1,.7-1.25Z"
				transform="translate(-0.036)"
				fill="#ffa800"
			/>
		</g>
	</svg>
)

export const BackIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={ICON_CLASS}>
		<g>
			<rect width="24" height="24" transform="translate(24) rotate(90)" fill="#6866e9" opacity="0" />
			<path
				d="M19,11H7.14l3.63-4.36A1,1,0,0,0,9.23,5.36l-5,6a1.19,1.19,0,0,0-.09.15.127.127,0,0,1-.07.13.961.961,0,0,0,0,.72.127.127,0,0,0,.07.13,1.19,1.19,0,0,0,.09.15l5,6a1,1,0,1,0,1.54-1.28L7.14,13H19a1,1,0,0,0,0-2Z"
				fill="#6866e9"
			/>
		</g>
	</svg>
)

export type StickyToolbarItem =
	| { key: string; color: keyof typeof LINK_CLASS; icon: ReactNode; label: string; onClick: () => void }
	| { key: string; color: keyof typeof LINK_CLASS; icon: ReactNode; label: string; to: SidebarRoutePath }

const LegacyStickyToolbar = ({ items }: { items: StickyToolbarItem[] }): JSX.Element => (
	<ul className="fixed right-0 bottom-[250px] z-[9] m-0 mb-[16px] flex w-[42px] cursor-pointer list-none flex-col justify-center rounded-l-[6px] bg-white p-0 text-center">
		{items.map((item) => (
			<li key={item.key} className={ITEM_CLASS}>
				{"to" in item ? (
					<Link to={item.to} aria-label={item.label} className={linkClass(item.color)}>
						{item.icon}
					</Link>
				) : (
					<a
						href="#"
						aria-label={item.label}
						onClick={(event: MouseEvent) => {
							event.preventDefault()
							item.onClick()
						}}
						className={linkClass(item.color)}
					>
						{item.icon}
					</a>
				)}
			</li>
		))}
	</ul>
)

export default LegacyStickyToolbar
