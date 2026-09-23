import { useState, type JSX, type ReactNode } from "react"

import { cn } from "@roja/utils"

/**
 * Port of bootstrap's `data-toggle="tooltip"`, as Porto initialises it: a dark bubble with
 * a matching arrow, shown on hover and on keyboard focus.
 *
 * Legacy passes `data-html="true"` in several places, so `content` is a ReactNode rather
 * than a string.
 */
type LegacyTooltipProps = {
	content: ReactNode
	placement?: "top" | "right" | "bottom" | "left"
	children: ReactNode
	className?: string
}

// Bootstrap 4 `.tooltip-inner`: #000 at .9, 6px radius, 4px/8px padding, max-width 200px
const BUBBLE =
	"pointer-events-none absolute z-[1070] w-max max-w-[200px] rounded-[6px] bg-black/90 px-[8px] py-[4px] text-center text-[11px] leading-[16px] text-white opacity-0 transition-opacity duration-150"

const PLACEMENT: Record<NonNullable<LegacyTooltipProps["placement"]>, string> = {
	top: "bottom-full left-1/2 mb-[5px] -translate-x-1/2",
	right: "left-full top-1/2 ml-[5px] -translate-y-1/2",
	bottom: "top-full left-1/2 mt-[5px] -translate-x-1/2",
	left: "right-full top-1/2 mr-[5px] -translate-y-1/2",
}

const LegacyTooltip = ({ content, placement = "top", children, className }: LegacyTooltipProps): JSX.Element => {
	const [open, setOpen] = useState(false)

	return (
		<span
			className={cn("relative inline-flex", className)}
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
			onFocus={() => setOpen(true)}
			onBlur={() => setOpen(false)}
		>
			{children}
			<span role="tooltip" className={cn(BUBBLE, PLACEMENT[placement], open && "opacity-100")}>
				{content}
			</span>
		</span>
	)
}

export default LegacyTooltip
