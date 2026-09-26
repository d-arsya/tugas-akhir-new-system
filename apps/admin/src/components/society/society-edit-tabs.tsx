import { useEffect, useState, type JSX, type ReactNode } from "react"

import { cn } from "@roja/utils"

// OWNER: AK-P. The icon-only tab strip of the society edit pages — `{registrant,student}/partials/edit/nav-tabs.blade.php`
// (identical) and `alumni/partials/edit/nav-tabs.blade.php` (an "award" tab first, no account tab), with
// `.tbr_tabs` / `.tbr_tab_content` from app.css 1598-1690. Every pane stays mounted, like the markup.

export type SocietyEditTabKey = "alumni" | "personal" | "identity" | "family" | "guardian" | "attachment" | "account"

// Anchors as the blades spell them (`#familiy`, `#guardianTab`)
const ANCHOR: Record<SocietyEditTabKey, string> = {
	alumni: "alumni",
	personal: "personal",
	identity: "identity",
	family: "familiy",
	guardian: "guardianTab",
	attachment: "attachment",
	account: "account",
}

const Icon = ({ children }: { children: ReactNode }): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<g>
			<rect width="24" height="24" fill="#abb4be" opacity="0" />
			{children}
		</g>
	</svg>
)

// `g#award`, `g#person`, `g#clipboard`, `g#people`, `g#edit`, `g#attach`, `g#unlock`
export const SOCIETY_TAB_ICONS: Record<SocietyEditTabKey, JSX.Element> = {
	alumni: (
		<Icon>
			<path d="M19,20.75l-2.31-9A5.94,5.94,0,0,0,18,8,6,6,0,1,0,6,8a5.94,5.94,0,0,0,1.34,3.77L5,20.75a1,1,0,0,0,1.48,1.11l5.33-3.13,5.68,3.14A.91.91,0,0,0,18,22a1,1,0,0,0,1-1.25ZM12,4A4,4,0,1,1,8,8a4,4,0,0,1,4-4Zm.31,12.71a1,1,0,0,0-1,0l-3.75,2.2L9,13.21a5.94,5.94,0,0,0,5.92,0L16.45,19Z" fill="#abb4be" />
		</Icon>
	),
	personal: (
		<Icon>
			<path d="M12,11A4,4,0,1,0,8,7,4,4,0,0,0,12,11Zm0-6a2,2,0,1,1-2,2A2,2,0,0,1,12,5Z" fill="#abb4be" />
			<path d="M12,13a7,7,0,0,0-7,7,1,1,0,0,0,2,0,5,5,0,0,1,10,0,1,1,0,0,0,2,0,7,7,0,0,0-7-7Z" fill="#abb4be" />
		</Icon>
	),
	identity: (
		<Icon>
			<path d="M18,5V4a2,2,0,0,0-2-2H8A2,2,0,0,0,6,4V5A3,3,0,0,0,3,8V19a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V8A3,3,0,0,0,18,5ZM8,4h8V8H8ZM19,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V8A1,1,0,0,1,6,7V8a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V7a1,1,0,0,1,1,1Z" fill="#abb4be" />
		</Icon>
	),
	family: (
		<Icon>
			<path d="M9,11A4,4,0,1,0,5,7,4,4,0,0,0,9,11ZM9,5A2,2,0,1,1,7,7,2,2,0,0,1,9,5Z" fill="#abb4be" />
			<path d="M17,13a3,3,0,1,0-3-3A3,3,0,0,0,17,13Zm0-4a1,1,0,1,1-1,1A1,1,0,0,1,17,9Z" fill="#abb4be" />
			<path d="M17,14a5,5,0,0,0-3.06,1.05A7,7,0,0,0,2,20a1,1,0,1,0,2,0,5,5,0,0,1,10,0,1,1,0,0,0,2,0,6.9,6.9,0,0,0-.86-3.35A3,3,0,0,1,20,19a1,1,0,1,0,2,0A5,5,0,0,0,17,14Z" fill="#abb4be" />
		</Icon>
	),
	guardian: (
		<Icon>
			<path d="M19.4,7.34,16.66,4.6A2,2,0,0,0,14,4.53l-9,9a2,2,0,0,0-.57,1.21L4,18.91A1,1,0,0,0,5,20h.09l4.17-.38a2,2,0,0,0,1.21-.57l9-9a1.92,1.92,0,0,0-.07-2.71ZM9.08,17.62l-3,.28.27-3L12,9.32l2.7,2.7ZM16,10.68,13.32,8l1.95-2L18,8.73Z" fill="#abb4be" />
		</Icon>
	),
	attachment: (
		<Icon>
			<path d="M9.29,21a6.23,6.23,0,0,1-4.43-1.88,6,6,0,0,1-.22-8.49L12,3.2A4.11,4.11,0,0,1,15,2a4.48,4.48,0,0,1,3.19,1.35,4.36,4.36,0,0,1,.15,6.13l-7.4,7.43a2.54,2.54,0,0,1-1.81.75,2.72,2.72,0,0,1-1.95-.82,2.68,2.68,0,0,1-.08-3.77l6.83-6.86A1,1,0,0,1,15.3,7.62L8.47,14.48a.68.68,0,0,0,.08.95.78.78,0,0,0,.53.23.56.56,0,0,0,.4-.16l7.39-7.43a2.36,2.36,0,0,0-.15-3.31,2.38,2.38,0,0,0-3.27-.15L6.06,12a4,4,0,0,0,.22,5.67,4.22,4.22,0,0,0,3,1.29,3.67,3.67,0,0,0,2.61-1.06l7.39-7.43a1,1,0,1,1,1.42,1.41l-7.39,7.43A5.65,5.65,0,0,1,9.29,21Z" fill="#abb4be" />
		</Icon>
	),
	account: (
		<Icon>
			<path d="M17,8H10V6a2,2,0,0,1,4,0,1,1,0,0,0,2,0A4,4,0,0,0,8,6V8H7a3,3,0,0,0-3,3v8a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V11A3,3,0,0,0,17,8Zm1,11a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V11a1,1,0,0,1,1-1H17a1,1,0,0,1,1,1Z" fill="#abb4be" />
			<path d="M12,12a3,3,0,1,0,3,3A3,3,0,0,0,12,12Zm0,4a1,1,0,1,1,1-1A1,1,0,0,1,12,16Z" fill="#abb4be" />
		</Icon>
	),
}

export type SocietyEditTab = { key: SocietyEditTabKey; content: ReactNode }

type SocietyEditTabsProps = {
	/** In blade order: registrant / student `personal…account`, alumni `alumni, personal…attachment`. */
	tabs: SocietyEditTab[]
	/** Controlled active tab; defaults to the first one (the blade's `.active`). */
	active?: SocietyEditTabKey
	onChange?: (key: SocietyEditTabKey) => void
}

/** `ul.nav.nav-tabs.tbr_tabs#myTab` + `div.tab-content.tbr_tab_content.mb-3.mb-lg-0#myTabContent` */
export default function SocietyEditTabs({ tabs, active, onChange }: SocietyEditTabsProps): JSX.Element {
	const [own, setOwn] = useState<SocietyEditTabKey | undefined>(tabs[0]?.key)
	const current = active ?? own
	// Bootstrap `.fade`: the newly shown pane fades in over 150ms
	const [shown, setShown] = useState(current)
	useEffect(() => {
		const frame = requestAnimationFrame(() => setShown(current))
		return () => cancelAnimationFrame(frame)
	}, [current])

	const pick = (key: SocietyEditTabKey): void => {
		setOwn(key)
		onChange?.(key)
	}

	return (
		<div>
			<ul role="tablist" className="m-0 flex list-none flex-wrap justify-center border-0 p-0 min-[993px]:justify-start">
				{tabs.map((tab) => {
					const isActive = tab.key === current
					return (
						<li key={tab.key} role="presentation" className="mr-[4px] mb-[4px] min-[993px]:mr-[2px] min-[993px]:mb-0">
							<a
								href={`#${ANCHOR[tab.key]}`}
								id={`${ANCHOR[tab.key]}-tab`}
								role="tab"
								aria-controls={ANCHOR[tab.key]}
								aria-selected={isActive}
								onClick={(event) => {
									event.preventDefault()
									pick(tab.key)
								}}
								className={cn(
									"block rounded-[12px] border-0 px-[16px] py-[10px] text-[12px] leading-[22.4px] min-[993px]:rounded-b-none",
									// `.nav-link.active svg path { fill: var(--warning) }`
									isActive
										? "bg-[var(--bg-secondary)] text-[var(--warning)] [&_path]:fill-[var(--warning)]"
										: "bg-[var(--bg-form-disabled)] text-[var(--grey)]",
								)}
							>
								<div className="flex items-center">{SOCIETY_TAB_ICONS[tab.key]}</div>
							</a>
						</li>
					)
				})}
			</ul>
			<div className="mb-[16px] min-[992px]:mb-0">
				{tabs.map((tab) => (
					<div
						key={tab.key}
						id={ANCHOR[tab.key]}
						role="tabpanel"
						aria-labelledby={`${ANCHOR[tab.key]}-tab`}
						hidden={tab.key !== current}
						className={cn(
							"rounded-[12px] bg-[var(--bg-secondary)] p-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)] transition-opacity duration-150 ease-linear min-[993px]:rounded-tl-none",
							tab.key === shown ? "opacity-100" : "opacity-0",
						)}
					>
						{tab.content}
					</div>
				))}
			</div>
		</div>
	)
}
