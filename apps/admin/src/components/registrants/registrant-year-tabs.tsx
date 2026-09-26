import { useEffect, useState, type JSX, type ReactNode } from "react"

import type { AdminRegistrantListTab } from "@roja/types"
import { cn } from "@roja/utils"

import LegacyLabel from "@/components/legacy/legacy-label"

export type RegistrantYearTab = {
	key: AdminRegistrantListTab
	label: string
	count: number | undefined
	variant: "primary" | "success" | "danger"
	content: ReactNode
}

const RegistrantYearTabs = ({ tabs }: { tabs: RegistrantYearTab[] }): JSX.Element => {
	const [active, setActive] = useState<AdminRegistrantListTab>("new")
	const [shown, setShown] = useState(active)
	useEffect(() => {
		const frame = requestAnimationFrame(() => setShown(active))
		return () => cancelAnimationFrame(frame)
	}, [active])

	return (
		<div>
			<ul role="tablist" className="m-0 flex list-none flex-wrap justify-center border-0 p-0 min-[993px]:justify-start">
				{tabs.map((tab) => {
					const isActive = tab.key === active
					return (
						<li key={tab.key} role="presentation" className="mr-[4px] mb-[4px] min-[993px]:mr-[2px] min-[993px]:mb-0 min-[1200px]:min-w-[187px]">
							<a
								href={`#${tab.key}-data`}
								role="tab"
								aria-selected={isActive}
								onClick={(event) => {
									event.preventDefault()
									setActive(tab.key)
								}}
								className={cn(
									"block rounded-[12px] border-0 px-[16px] py-[10px] text-[12px] leading-[22.4px] min-[993px]:rounded-b-none",
									isActive ? "bg-[var(--bg-secondary)] text-[var(--primary)]" : "bg-[var(--bg-form-disabled)] text-[var(--grey)]",
								)}
							>
								<div className="flex items-center justify-center">
									<span className="mx-[8px] font-medium">{tab.label}</span>
									<LegacyLabel variant={tab.variant} className="min-h-0 min-w-0 px-[14px] py-[4px]">
										{tab.count ?? ""}
									</LegacyLabel>
								</div>
							</a>
						</li>
					)
				})}
			</ul>
			<div>
				{tabs.map((tab) => (
					<div
						key={tab.key}
						id={`${tab.key}-data`}
						role="tabpanel"
						hidden={tab.key !== active}
						className={cn(
							"overflow-hidden rounded-[12px] bg-[var(--bg-secondary)] p-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)] transition-opacity duration-150 ease-linear min-[993px]:rounded-tl-none",
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

export default RegistrantYearTabs
