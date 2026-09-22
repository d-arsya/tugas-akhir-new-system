import { useEffect, useState, type JSX, type ReactNode } from "react"

import { cn } from "@roja/utils"

export type LegacyTab<K extends string> = { key: K; label: string; content: ReactNode }

type LegacyTabsProps<K extends string> = {
	tabs: LegacyTab<K>[]
	active: K
	onChange: (key: K) => void
	className?: string
}

// Port of `ul.nav.nav-tabs.tbr_tabs` + `.tab-content.tbr_tab_content` (public/assets/css/app.css).
// Every pane stays mounted like the legacy markup, so each keeps its own state
const LegacyTabs = <K extends string>({ tabs, active, onChange, className }: LegacyTabsProps<K>): JSX.Element => {
	// Bootstrap `.fade`: the newly shown pane fades in over 150ms
	const [shown, setShown] = useState(active)
	useEffect(() => {
		const frame = requestAnimationFrame(() => setShown(active))
		return () => cancelAnimationFrame(frame)
	}, [active])

	return (
		<div className={className}>
			<ul role="tablist" className="m-0 flex list-none flex-wrap justify-center border-0 p-0 min-[993px]:justify-start">
				{tabs.map((tab) => {
					const isActive = tab.key === active
					return (
						<li key={tab.key} role="presentation" className="mr-[4px] mb-[4px] min-[993px]:mr-[2px] min-[993px]:mb-0">
							<a
								href={`#${tab.key}`}
								role="tab"
								aria-selected={isActive}
								onClick={(event) => {
									event.preventDefault()
									onChange(tab.key)
								}}
								className={cn(
									"block rounded-[12px] border-0 px-[16px] py-[10px] text-[12px] leading-[22.4px] min-[993px]:rounded-b-none",
									isActive ? "bg-[var(--bg-secondary)] text-[var(--warning)]" : "bg-[var(--bg-form-disabled)] text-[var(--grey)]",
								)}
							>
								<div className="flex items-center">
									<span className="mx-[8px]">{tab.label}</span>
								</div>
							</a>
						</li>
					)
				})}
			</ul>
			<div className="mb-[24px] min-[1200px]:mb-0">
				{tabs.map((tab) => (
					<div
						key={tab.key}
						role="tabpanel"
						hidden={tab.key !== active}
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

export default LegacyTabs
