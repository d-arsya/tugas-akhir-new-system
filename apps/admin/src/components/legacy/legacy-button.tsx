import type { ButtonHTMLAttributes, JSX } from "react"

import { cn } from "@roja/utils"

// Legacy `.btn.tbr_btn` variants (public/assets/css/app.css)
const VARIANT = {
	"light-primary":
		"bg-[rgba(228,0,126,0.16)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white focus:bg-[var(--primary)] focus:text-white",
	secondary:
		"bg-[var(--secondary)] text-white shadow-[0px_8px_10px_0px_rgba(141,195,30,0.25)] hover:text-white hover:shadow-none focus:text-white focus:shadow-none",
	success:
		"bg-[var(--success)] text-white shadow-[0px_8px_10px_0px_rgba(40,175,82,0.25)] hover:text-white hover:shadow-none focus:text-white focus:shadow-none",
} as const

export type LegacyButtonVariant = keyof typeof VARIANT

// Base `.btn` + `.tbr_btn`: 40px min height, 12px text, 6px radius, centred content
export const legacyButtonClass = (variant: LegacyButtonVariant, className?: string): string =>
	cn(
		"inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-[6px] border-0 px-[16px] py-[7.52px] text-center align-middle text-[12px] leading-[18px] tracking-[0.5px] whitespace-nowrap outline-none select-none transition-all duration-300 disabled:cursor-default disabled:opacity-65",
		VARIANT[variant],
		className,
	)

type LegacyButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant: LegacyButtonVariant }

const LegacyButton = ({ variant, className, type = "button", ...props }: LegacyButtonProps): JSX.Element => (
	<button type={type} className={legacyButtonClass(variant, className)} {...props} />
)

export default LegacyButton
