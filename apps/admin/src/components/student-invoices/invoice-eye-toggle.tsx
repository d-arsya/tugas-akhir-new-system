import type { JSX } from "react"

import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"

import { EyeOffIcon, EyeOnIcon } from "./invoice-icons"

export type EyeToggleState = "active" | "deactive"

type InvoiceEyeToggleProps = {
	state: EyeToggleState
	tone: "success" | "primary"
	title: string
	placement: "top" | "left"
	onClick: () => void
}

const InvoiceEyeToggle = ({ state, tone, title, placement, onClick }: InvoiceEyeToggleProps): JSX.Element => {
	const active = state === "active"
	const solid =
		tone === "success"
			? "bg-[var(--success)] text-white shadow-[0px_8px_10px_0px_rgba(var(--success-rgb),0.25)]"
			: "bg-[var(--primary)] text-white shadow-[0px_8px_10px_0px_rgba(var(--primary-rgb),0.25)]"
	const light =
		tone === "success"
			? "bg-[rgba(var(--success-rgb),0.16)] text-[var(--success)] hover:bg-[var(--success)] hover:text-white"
			: "bg-[rgba(var(--primary-rgb),0.16)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"

	return (
		<LegacyTooltip content={title} placement={placement} className="mr-[8px]">
			<button
				type="button"
				aria-pressed={active}
				aria-label={title}
				onClick={onClick}
				className={cn(legacyButtonClass("light", "px-[8px] py-[8px]"), "bg-transparent", active ? solid : light)}
			>
				{active ? <EyeOnIcon /> : <EyeOffIcon fill={tone === "success" ? "#28af52" : "#E4007E"} />}
			</button>
		</LegacyTooltip>
	)
}

export default InvoiceEyeToggle
