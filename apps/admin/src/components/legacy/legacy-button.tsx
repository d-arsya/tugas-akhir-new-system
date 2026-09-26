import type { ButtonHTMLAttributes, JSX } from "react"

import { cn } from "@roja/utils"

import { ensureLegacyStyle } from "./legacy-style"

ensureLegacyStyle(
	"legacy-spinner-grow",
	"@keyframes legacy-spinner-grow{0%{transform:scale(0)}50%{opacity:1;transform:none}}",
)

const VARIANT = {
	primary:
		"bg-[var(--primary)] text-white shadow-[0px_8px_10px_0px_rgba(228,0,126,0.25)] hover:text-white hover:shadow-none focus:text-white focus:shadow-none",
	"light-primary":
		"bg-[rgba(228,0,126,0.16)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white focus:bg-[var(--primary)] focus:text-white",
	"light-danger":
		"bg-[rgba(248,55,75,0.16)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white focus:bg-[var(--danger)] focus:text-white active:bg-[var(--danger)] active:text-white",
	secondary:
		"bg-[var(--secondary)] text-white shadow-[0px_8px_10px_0px_rgba(141,195,30,0.25)] hover:text-white hover:shadow-none focus:text-white focus:shadow-none",
	success:
		"bg-[var(--success)] text-white shadow-[0px_8px_10px_0px_rgba(40,175,82,0.25)] hover:text-white hover:shadow-none focus:text-white focus:shadow-none",
	danger:
		"bg-[var(--danger)] text-white shadow-[0px_8px_10px_0px_rgba(248,55,75,0.25)] hover:text-white hover:shadow-none focus:text-white focus:shadow-none",
	warning:
		"bg-[var(--warning)] text-white shadow-[0px_8px_10px_0px_rgba(255,168,0,0.25)] hover:text-white hover:shadow-none focus:text-white focus:shadow-none",
	info: "bg-[var(--info)] text-white shadow-[0px_8px_10px_0px_rgba(104,102,233,0.25)] hover:text-white hover:shadow-none focus:text-white focus:shadow-none",
	light: "bg-[var(--bg-btn-light-inverse)] text-[var(--grey)] hover:text-[var(--body-txt-inverse)] focus:text-[var(--body-txt-inverse)]",
} as const

export type LegacyButtonVariant = keyof typeof VARIANT

export const legacyButtonClass = (variant: LegacyButtonVariant, className?: string): string =>
	cn(
		"relative inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-[6px] border-0 px-[16px] py-[7.52px] text-center align-middle text-[12px] leading-[18px] tracking-[0.5px] whitespace-nowrap outline-none select-none transition-all duration-300 disabled:cursor-default disabled:opacity-65",
		VARIANT[variant],
		className,
	)

type LegacyButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant: LegacyButtonVariant; loading?: boolean }

const LegacyButton = ({ variant, className, type = "button", loading = false, children, disabled, ...props }: LegacyButtonProps): JSX.Element => (
	<button type={type} disabled={disabled === true || loading} className={legacyButtonClass(variant, className)} {...props}>
		{loading ? (
			<span
				role="status"
				className="absolute h-[32px] w-[32px] rounded-full bg-white opacity-0 [animation:legacy-spinner-grow_0.75s_linear_infinite]"
			/>
		) : null}
		<span className={loading ? "invisible" : undefined}>{children}</span>
	</button>
)

export default LegacyButton
