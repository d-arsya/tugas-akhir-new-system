import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import { legacyButtonClass, type LegacyButtonVariant } from "./legacy-button"

/**
 * The icon-only save button on the Kelas page: `.btn.tbr_btn.tbr_btn-light-primary.p-2.mb-2`
 * whose `.tbr_btn_text` holds nothing but a 24×24 SVG — no label at all.
 *
 * It exists separately from `LegacyButton` because the padding collapses to `p-2` and the
 * accessible name has to come from `ariaLabel` rather than the (absent) text.
 */
type LegacyIconButtonProps = {
	variant: LegacyButtonVariant
	icon: ReactNode
	/** There is no visible text, so every instance must name itself for screen readers. */
	ariaLabel: string
	type?: "button" | "submit"
	onClick?: () => void
	loading?: boolean
	disabled?: boolean
	className?: string
}

const LegacyIconButton = ({
	variant,
	icon,
	ariaLabel,
	type = "button",
	onClick,
	loading = false,
	disabled = false,
	className,
}: LegacyIconButtonProps): JSX.Element => (
	<button
		type={type}
		aria-label={ariaLabel}
		disabled={disabled || loading}
		onClick={onClick}
		className={cn(legacyButtonClass(variant, "px-[8px] py-[8px]"), className)}
	>
		<span className={cn("inline-flex items-center", loading && "invisible")}>{icon}</span>
		{loading ? (
			<span
				className="absolute h-[20px] w-[20px] animate-spin rounded-full border-2 border-current border-r-transparent [animation-duration:0.75s]"
				role="status"
			/>
		) : null}
	</button>
)

export default LegacyIconButton
