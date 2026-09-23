import type { JSX } from "react"

import { cn } from "@roja/utils"

import type { InvoiceStatusLabel } from "@roja/types"

/**
 * `StudentInvoiceController@listBillServerSide`'s `addColumn('status')`.
 *
 * `.tbr_label` (app.css 1183-1229) sized by `.tbr_table tr td .tbr_label` (datatable.css 177-185):
 * 80px min width, 30px min height, 6px/10px padding, centred. The shared `<LegacyLabel>` only
 * carries `success` and `danger`; the Tagihan tab also needs `tbr_label-warning` for "Diangsur",
 * so the three variants live here until the kit grows one.
 */
const VARIANT: Record<InvoiceStatusLabel, string> = {
	"Belum Dibayar": "bg-[rgba(248,55,75,0.1)] text-[var(--danger)]",
	Dibayar: "bg-[rgba(40,175,82,0.1)] text-[var(--success)]",
	Diangsur: "bg-[rgba(255,168,0,0.1)] text-[var(--warning)]",
}

type InvoiceStatusLabelBadgeProps = { label: InvoiceStatusLabel | null; className?: string }

/**
 * A paid invoice with no `payment_method` matches none of legacy's three branches, so the PHP
 * function returns null and the cell renders empty — 49 live invoices are in that state.
 */
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
