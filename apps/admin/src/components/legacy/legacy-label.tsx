import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"


// `.tbr_label` (app.css 1183-1229) sized by `.tbr_table tr td .tbr_label` (datatable.css 177-185)
// app.css 1183-1232: every `.tbr_label-*` is `rgba(var(--rgb-<name>), 0.1)` over `var(--<name>)`.
// The app names its channels `--<name>-rgb`; the numbers are identical to the literals these
// replace, so the computed colours are unchanged.
const VARIANT = {
	success: "bg-[rgba(var(--success-rgb),0.1)] text-[var(--success)]",
	danger: "bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)]",
	warning: "bg-[rgba(var(--warning-rgb),0.1)] text-[var(--warning)]",
	primary: "bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary)]",
	info: "bg-[rgba(var(--info-rgb),0.1)] text-[var(--info)]",
	// `.tbr_label-solid-primary` — filled, not tinted; the badge on the santri card
	"solid-primary": "bg-[var(--primary)] text-[var(--white)] shadow-[0px_8px_10px_0px_rgba(var(--primary-rgb),0.25)]",
} as const

type LegacyLabelProps = { variant: keyof typeof VARIANT; className?: string; children: ReactNode }

const LegacyLabel = ({ variant, className, children }: LegacyLabelProps): JSX.Element => (
	<span
		className={cn(
			"relative inline-block min-h-[30px] min-w-[80px] rounded-[6px] px-[10px] py-[6px] text-center",
			VARIANT[variant],
			className,
		)}
	>
		{children}
	</span>
)

export default LegacyLabel
