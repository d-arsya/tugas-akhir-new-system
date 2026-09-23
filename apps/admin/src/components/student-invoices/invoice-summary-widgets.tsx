import type { JSX } from "react"

import type { InvoiceDetailSummary } from "@roja/types"
import { cn } from "@roja/utils"

import { rupiahDots } from "@/lib/legacy-format"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

// The three tiles above the tabs — `student-invoice/detail.blade.php` 40-71.
//
// `<LegacyInvoiceWidget>` in the kit is hard-wired to two variants (primary / secondary) and to
// the dashboard's four-across column, while this row is three-across and uses `tbr_widget-danger`
// and `tbr_widget-warning`. Transcribed from widget.css 39-120 + 258-273 rather than reused.

const VARIANT = {
	// `.tbr_widget.tbr_widget-{name}`: the variant colour plus `0px 8px 10px rgba(<rgb>, 0.25)`
	primary: { widget: "bg-[var(--primary)] shadow-[0px_8px_10px_0px_rgba(var(--primary-rgb),0.25)]", icon: "/assets/svg/icons/dollar-s.svg" },
	danger: { widget: "bg-[var(--danger)] shadow-[0px_8px_10px_0px_rgba(var(--danger-rgb),0.25)]", icon: "/assets/svg/icons/three-line-45.svg" },
	warning: { widget: "bg-[var(--warning)] shadow-[0px_8px_10px_0px_rgba(var(--warning-rgb),0.25)]", icon: "/assets/svg/icons/three-line-45.svg" },
} as const

type Variant = keyof typeof VARIANT

/** One tile in its `col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12` column. */
const Widget = ({ variant, value, label }: { variant: Variant; value: string; label: string }): JSX.Element => (
	<div className="w-full px-[15px] min-[576px]:w-1/2 min-[992px]:w-1/3">
		<span
			onClick={triggerRipple}
			className={cn(
				// `.tbr_widget` + `.tbr_widget-invoice`, whose `background: none` drops Widget-Bg.svg
				// and whose padding collapses to `1rem 1rem 1rem 2.5rem` on a 1rem line height
				"mb-[16px] flex w-full flex-row flex-nowrap items-center rounded-[12px] py-[16px] pr-[16px] pl-[40px] text-[12px] leading-[16px] text-[var(--light)] transition-all duration-300 hover:shadow-none active:shadow-none",
				RIPPLE_CLASS,
				VARIANT[variant].widget,
			)}
		>
			<img src={VARIANT[variant].icon} alt="icon" className="absolute top-[-6px] left-[-6px] max-w-none" />
			<img src="/assets/svg/etc/Widget-Bg-Invoice.svg" alt="icon" className="absolute right-[-40px] bottom-[-50px] max-w-none" />
			<div>
				{/* `.tbr_widget_invoice.tbr_weight-bold` */}
				<div className="mt-[7px] mb-[8px] text-[20px] font-bold">{value}</div>
				<div>{label}</div>
			</div>
		</span>
	</div>
)

/** `.row.py-0` holding the three tiles. */
const InvoiceSummaryWidgets = ({ summary }: { summary: InvoiceDetailSummary }): JSX.Element => (
	<div className="mx-[-15px] flex flex-wrap py-0">
		{/* `number_format($total >= 0 ? $total : 0)` — no "Rp" prefix on this tile */}
		<Widget variant="primary" value={rupiahDots(summary.totalUnpaid)} label="Total belum dibayar" />
		<Widget variant="danger" value={String(summary.unpaidItemCount)} label="Item belum dibayar" />
		<Widget variant="warning" value={String(summary.installmentItemCount)} label="Item diangsur" />
	</div>
)

export default InvoiceSummaryWidgets
