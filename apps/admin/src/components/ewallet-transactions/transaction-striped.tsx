import type { JSX, ReactNode } from "react"

import type { EwalletTransactionStatus } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyLabel from "@/components/legacy/legacy-label"

// `public/assets/css/ewallet/detail-transaction.css` — `.tbr_striped`, `.tbr_striped_item`,
// `.tbr_striped_label`, `.tbr_striped_value`. Shared by the cash, bank-transfer and purchase pages.

/** `.tbr_striped` bleeds the stripes out to the card edges (`margin: 0 -24px`). */
export const Striped = ({ children, className }: { children: ReactNode; className?: string }): JSX.Element => (
	<div className={cn("mx-[-24px]", className)}>{children}</div>
)

type StripedItemProps = {
	/** The label cell; omit for the full-width "Detail Transaksi" row of the purchase card. */
	label?: ReactNode
	children: ReactNode
	/** `text-left flex-grow-1` on the value cell (the purchase page) instead of the right-aligned default. */
	leftValue?: boolean
	/** `style="border-radius: 0 0 12px 12px;"` on the last rows of the purchase cards. */
	roundedBottom?: boolean
}

// `:nth-child(odd)` stripes count every sibling, so nothing but items may sit between them
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

/** `_partials/status.blade.php` / `EwalletController::statusLabel`. */
const STATUS: Record<EwalletTransactionStatus, { variant: "warning" | "success" | "danger" | "primary"; text: string }> = {
	waiting: { variant: "warning", text: "Menunggu" },
	valid: { variant: "success", text: "Berhasil" },
	invalid: { variant: "danger", text: "Gagal" },
	process: { variant: "primary", text: "Diproses" },
}

// `.tbr_label` outside a table (app.css 1183-1229): 4px/14px padding, no minimum size, the body font
const PLAIN_VARIANT = {
	warning: "bg-[rgba(var(--warning-rgb),0.1)] text-[var(--warning)]",
	success: "bg-[rgba(var(--success-rgb),0.1)] text-[var(--success)]",
	danger: "bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)]",
	primary: "bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary)]",
} as const

/** A label inside the list's table takes the table sizing (the kit label); on a card it is the plain one. */
export const PlainLabel = ({ variant, className, children }: { variant: keyof typeof PLAIN_VARIANT; className?: string; children: ReactNode }): JSX.Element => (
	<span className={cn("relative inline-block rounded-[6px] px-[14px] py-[4px]", PLAIN_VARIANT[variant], className)}>{children}</span>
)

export const StatusLabel = ({ status, inTable = false, className }: { status: EwalletTransactionStatus; inTable?: boolean; className?: string }): JSX.Element | null => {
	const entry = STATUS[status]
	if (!entry) return null
	if (inTable) return <LegacyLabel variant={entry.variant}>{entry.text}</LegacyLabel>
	return <PlainLabel variant={entry.variant} {...(className ? { className } : {})}>{entry.text}</PlainLabel>
}

/** `.btn.tbr_btn.tbr_btn-light-info` (app.css 684-688, 830-836) — the kit has no such variant. */
export const LIGHT_INFO_BUTTON =
	"bg-[rgba(var(--info-rgb),0.16)] text-[var(--info)] hover:bg-[var(--info)] hover:text-white focus:bg-[var(--info)] focus:text-white active:bg-[var(--info)] active:text-white"

/** Classes of the "Kembali" anchor every one of these pages ends with. */
export const backButtonClass = (className?: string): string => legacyButtonClass("light", cn(LIGHT_INFO_BUTTON, className))
