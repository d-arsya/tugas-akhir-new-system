import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

type LegacyLabelProps = { variant: "success" | "danger"; className?: string; children: ReactNode }

// `.tbr_label` (app.css 1183-1229) sized by `.tbr_table tr td .tbr_label` (datatable.css 177-185)
const VARIANT = {
	success: "bg-[rgba(40,175,82,0.1)] text-[var(--success)]",
	danger: "bg-[rgba(248,55,75,0.1)] text-[var(--danger)]",
} as const

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
