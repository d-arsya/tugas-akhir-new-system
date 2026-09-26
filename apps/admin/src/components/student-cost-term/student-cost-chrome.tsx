import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import { InfoCircleIcon } from "@/components/legacy/legacy-icons"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"

export const CostCard = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("relative flex min-w-0 flex-col border-0 bg-transparent shadow-none", className)}>
		<div className="min-h-px flex-auto rounded-[5px] bg-[var(--bg-primary)] p-[20px] shadow-[inset_0_0_5px_#e3e3e3]">
			{children}
		</div>
	</div>
)

export const HelpLabel = ({
	bold,
	htmlFor,
	children,
}: {
	bold: boolean
	htmlFor?: string
	children: ReactNode
}): JSX.Element => (
	<label htmlFor={htmlFor} className="relative mt-0 mb-[8px] block leading-[20px]">
		<span
			className={cn(
				"m-0 mb-[4px] block p-0 text-[11px] leading-[20px] text-[var(--grey)] opacity-80",
				bold ? "font-bold" : "font-normal",
			)}
		>
			{children}
		</span>
	</label>
)

export const Row = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("mx-[-15px] flex flex-wrap", className)}>{children}</div>
)

export const RowTight = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("flex flex-wrap", className)}>{children}</div>
)

export const Col = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("w-full px-[15px]", className)}>{children}</div>
)

export const ColTight = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("w-full", className)}>{children}</div>
)

export const CostTooltip = ({
	content,
	placement = "top",
	className,
}: {
	content: ReactNode
	placement?: "top" | "right"
	className?: string
}): JSX.Element => (
	<LegacyTooltip content={content} placement={placement} {...(className === undefined ? {} : { className })}>
		<InfoCircleIcon />
	</LegacyTooltip>
)
