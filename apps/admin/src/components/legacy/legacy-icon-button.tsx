import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import { legacyButtonClass, type LegacyButtonVariant } from "./legacy-button"

type LegacyIconButtonProps = {
	variant: LegacyButtonVariant
	icon: ReactNode
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
