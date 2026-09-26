import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@roja/utils"

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

export const ACTION_LINK_CLASS = "mr-[5px] inline-block cursor-pointer align-middle whitespace-normal last:mr-0"

export const DestroyAction = ({ onClick }: { onClick: () => void }): JSX.Element => (
	<button type="button" onClick={onClick} className={ACTION_LINK_CLASS}>
		{DESTROY_ICON}
	</button>
)

export { DETAIL_ICON }

export const YearDetailAction = ({ academicYearId }: { academicYearId: number }): JSX.Element => (
	<div>
		<Link to="/students/academic-years/$academicYearId" params={{ academicYearId: String(academicYearId) }} className={ACTION_LINK_CLASS}>
			{DETAIL_ICON}
		</Link>
	</div>
)

export const noticeLines = (message: string): string[] => message.split(/<br\s*\/?>/i).map((line) => line.trim())
