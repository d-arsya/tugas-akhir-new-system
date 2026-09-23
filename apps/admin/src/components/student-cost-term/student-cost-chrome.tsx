import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import { InfoCircleIcon } from "@/components/legacy/legacy-icons"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"

/**
 * `.card.tbr_cost_card > .card-body` — the inner grey panel each block of the Biaya Santri form
 * sits in. Porto strips `.card` to nothing (theme.css 7425) and styles `.card-body` (7557:
 * 5px radius, 20px padding); `app.css 1541` then repaints the body `--bg-primary` with an
 * inset shadow instead of the usual drop shadow.
 */
export const CostCard = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("relative flex min-w-0 flex-col border-0 bg-transparent shadow-none", className)}>
		<div className="min-h-px flex-auto rounded-[5px] bg-[var(--bg-primary)] p-[20px] shadow-[inset_0_0_5px_#e3e3e3]">
			{children}
		</div>
	</div>
)

/**
 * `label.control-label > span.help-block` (form.css 11-19): 11px grey at .8 opacity.
 *
 * The **create** blade adds `font-weight-bold` to every one of these and the **edit** blade
 * does not — a real difference between the two pages, so `bold` is a prop rather than a
 * constant.
 */
export const HelpLabel = ({
	bold,
	htmlFor,
	children,
}: {
	bold: boolean
	htmlFor?: string
	children: ReactNode
}): JSX.Element => (
	// Unlike the `.control-label.m-0` on the outer form rows, these labels keep bootstrap's
	// `label { margin-bottom: .5rem }` — the blades write a bare `.control-label` here
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

/**
 * Bootstrap 4 `.row` and `.col-*`. These blocks nest rows inside the grey card, and the
 * ±15px gutter is load-bearing: dropping it makes every control ~10px too wide, which is
 * exactly what the first pass measured against the legacy render.
 *
 * `.no-gutters` zeroes the row margin and the column padding; `.col-md-*` only applies from
 * 768px up, `.col-N` at every width.
 */
export const Row = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("mx-[-15px] flex flex-wrap", className)}>{children}</div>
)

/** `.row.no-gutters` — no negative margin, and its children carry no padding. */
export const RowTight = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("flex flex-wrap", className)}>{children}</div>
)

export const Col = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("w-full px-[15px]", className)}>{children}</div>
)

/** A `.no-gutters` column: the padding the row would have cancelled is simply absent. */
export const ColTight = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("w-full", className)}>{children}</div>
)

/** The orange `?` disc every one of these blocks hangs a `data-toggle="tooltip"` on. */
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
