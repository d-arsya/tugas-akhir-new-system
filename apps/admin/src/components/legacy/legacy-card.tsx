import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

type LegacyCardProps = { className?: string; bodyClassName?: string; children: ReactNode }

const LegacyCard = ({ className, bodyClassName, children }: LegacyCardProps): JSX.Element => (
	<div className={cn("relative flex min-w-0 flex-col border-0 bg-transparent shadow-none", className)}>
		<div
			className={cn(
				"min-h-px flex-auto rounded-[12px] bg-[var(--bg-secondary)] p-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]",
				bodyClassName,
			)}
		>
			{children}
		</div>
	</div>
)

type WithChildren = { className?: string; children: ReactNode }

export const LegacyCardTitle = ({ className, children }: WithChildren): JSX.Element => (
	<h4
		className={cn(
			"m-0! mb-[8px]! text-[20px]! leading-[22.4px]! font-semibold! tracking-normal! text-[var(--heading-txt-inverse)]!",
			className,
		)}
	>
		{children}
	</h4>
)

export const LegacyCardText = ({ className, children }: WithChildren): JSX.Element => (
	<p className={cn("mt-0 mb-[20px] leading-[24px] text-[var(--grey)]", className)}>{children}</p>
)

export const LegacyDivider = ({ className }: { className?: string }): JSX.Element => (
	<hr
		className={cn(
			"my-[22px] h-px border-0 bg-[linear-gradient(to_left,rgba(0,0,0,0),var(--bg-primary),rgba(0,0,0,0))]",
			className,
		)}
	/>
)

export default LegacyCard
