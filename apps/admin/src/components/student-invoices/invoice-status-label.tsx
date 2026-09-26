import type { JSX } from "react"

import { cn } from "@roja/utils"

import type { InvoiceStatusLabel } from "@roja/types"

const VARIANT: Record<InvoiceStatusLabel, string> = {
	"Belum Dibayar": "bg-[rgba(248,55,75,0.1)] text-[var(--danger)]",
	Dibayar: "bg-[rgba(40,175,82,0.1)] text-[var(--success)]",
	Diangsur: "bg-[rgba(255,168,0,0.1)] text-[var(--warning)]",
}

type InvoiceStatusLabelBadgeProps = { label: InvoiceStatusLabel | null; className?: string }

const InvoiceStatusLabelBadge = ({ label, className }: InvoiceStatusLabelBadgeProps): JSX.Element | null => {
	if (label === null) return null
	return (
		<span
			className={cn(
				"relative inline-block min-h-[30px] min-w-[80px] rounded-[6px] px-[10px] py-[6px] text-center",
				VARIANT[label],
				className,
			)}
		>
			{label}
		</span>
	)
}

export default InvoiceStatusLabelBadge
