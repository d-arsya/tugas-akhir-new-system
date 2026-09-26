import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@roja/utils"

// Small pieces the Santri pages share: the `.tbr_label` colours the kit does not carry, the
// `.actions` cell of `StudentService::editButton` / `AcademicYearService::getAction`, and the
// legacy SVGs of the card headers.

// `.tbr_label` (app.css 1183-1232) — every `-<name>` is `rgba(var(--rgb-<name>), 0.1)` over `var(--<name>)`
const LABEL = {
	primary: "bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary)]",
	secondary: "bg-[rgba(var(--secondary-rgb),0.1)] text-[var(--secondary)]",
	tertiary: "bg-[rgba(var(--tertiary-rgb),0.1)] text-[var(--tertiary)]",
	success: "bg-[rgba(var(--success-rgb),0.1)] text-[var(--success)]",
	warning: "bg-[rgba(var(--warning-rgb),0.1)] text-[var(--warning)]",
	danger: "bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)]",
	info: "bg-[rgba(var(--info-rgb),0.1)] text-[var(--info)]",
} as const

export type StudentLabelVariant = keyof typeof LABEL

// `.tbr_label` is 4px/14px (app.css 1183); inside `.tbr_table` it is 30px tall, 80px wide, 6px/10px (datatable.css 177-185)
const LABEL_SIZE = {
	table: "min-h-[30px] min-w-[80px] px-[10px] py-[6px]",
	base: "px-[14px] py-[4px]",
} as const

export const StudentLabel = ({
	variant,
	size = "table",
	className,
	children,
}: {
	variant: StudentLabelVariant
	size?: keyof typeof LABEL_SIZE
	className?: string
	children: ReactNode
}): JSX.Element => (
	<span className={cn("relative inline-block rounded-[6px] text-center", LABEL_SIZE[size], LABEL[variant], className)}>{children}</span>
)

const DETAIL_ICON = <img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
const DESTROY_ICON = <img src="/assets/svg/icons/data_destroy.svg" alt="Destroy" width={24} height={24} />

/** `.table .actions a` — inline-block, 5px apart; the `{" "}` is the newline Blade leaves between them. */
export const ACTION_LINK_CLASS = "mr-[5px] inline-block cursor-pointer align-middle whitespace-normal last:mr-0"

export const DestroyAction = ({ onClick }: { onClick: () => void }): JSX.Element => (
	<button type="button" onClick={onClick} className={ACTION_LINK_CLASS}>
		{DESTROY_ICON}
	</button>
)

export { DETAIL_ICON }

/** `StudentService::editButton()` — the detail magnifier only (the year list). */
export const YearDetailAction = ({ academicYearId }: { academicYearId: number }): JSX.Element => (
	<div>
		<Link to="/students/academic-years/$academicYearId" params={{ academicYearId: String(academicYearId) }} className={ACTION_LINK_CLASS}>
			{DETAIL_ICON}
		</Link>
	</div>
)

/** Split a legacy PNotify text on its `<br>` tags into notice lines. */
export const noticeLines = (message: string): string[] => message.split(/<br\s*\/?>/i).map((line) => line.trim())
