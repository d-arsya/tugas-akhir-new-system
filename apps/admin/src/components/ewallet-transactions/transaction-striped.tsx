import type { JSX, ReactNode } from "react"

import type { EwalletTransactionStatus } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyLabel from "@/components/legacy/legacy-label"

export const Striped = ({ children }: { children: ReactNode }): JSX.Element => <div className="mx-[-24px]">{children}</div>

type StripedItemProps = {
	label?: ReactNode
	children: ReactNode
	leftValue?: boolean
	roundedBottom?: boolean
}

export const StripedItem = ({ label, children, leftValue = false, roundedBottom = false }: StripedItemProps): JSX.Element => (
	<div className={cn("flex justify-between px-[24px] py-[20px] odd:bg-[#F1F1FC]", roundedBottom && "rounded-b-[12px]")}>
		<div className="max-w-[45%] text-left">
			<span>{label}</span>
		</div>
		<div className={cn("max-w-[45%]", leftValue ? "grow text-left" : "text-right")}>
			<span>{children}</span>
		</div>
	</div>
)

const STATUS: Record<EwalletTransactionStatus, { variant: "warning" | "success" | "danger" | "primary"; text: string }> = {
	waiting: { variant: "warning", text: "Menunggu" },
	valid: { variant: "success", text: "Berhasil" },
	invalid: { variant: "danger", text: "Gagal" },
	process: { variant: "primary", text: "Diproses" },
}

const PLAIN_VARIANT = {
	warning: "bg-[rgba(var(--warning-rgb),0.1)] text-[var(--warning)]",
	success: "bg-[rgba(var(--success-rgb),0.1)] text-[var(--success)]",
	danger: "bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)]",
	primary: "bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary)]",
} as const

export const PlainLabel = ({ variant, className, children }: { variant: keyof typeof PLAIN_VARIANT; className?: string; children: ReactNode }): JSX.Element => (
	<span className={cn("relative inline-block rounded-[6px] px-[14px] py-[4px]", PLAIN_VARIANT[variant], className)}>{children}</span>
)

export const StatusLabel = ({ status, inTable = false, className }: { status: EwalletTransactionStatus; inTable?: boolean; className?: string }): JSX.Element | null => {
	const entry = STATUS[status]
	if (!entry) return null
	if (inTable) return <LegacyLabel variant={entry.variant}>{entry.text}</LegacyLabel>
	return <PlainLabel variant={entry.variant} {...(className ? { className } : {})}>{entry.text}</PlainLabel>
}

const LIGHT_INFO_BUTTON =
	"bg-[rgba(var(--info-rgb),0.16)] text-[var(--info)] hover:bg-[var(--info)] hover:text-white focus:bg-[var(--info)] focus:text-white active:bg-[var(--info)] active:text-white"

export const backButtonClass = (className?: string): string => legacyButtonClass("light", cn(LIGHT_INFO_BUTTON, className))
