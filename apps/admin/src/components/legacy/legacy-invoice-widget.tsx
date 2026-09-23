import type { JSX } from "react"

import { cn } from "@roja/utils"

import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

// widget.css 41-63: each `.tbr_widget-*` is `background-color: var(--<name>)` with a
// `rgba(var(--rgb-<name>), 0.25)` shadow. The app names its channels `--<name>-rgb`.
const VARIANT = {
	primary: {
		widget: "bg-[var(--primary)] shadow-[0px_8px_10px_0px_rgba(var(--primary-rgb),0.25)]",
		icon: "/assets/svg/icons/dollar-s.svg",
	},
	secondary: {
		widget: "bg-[var(--secondary)] shadow-[0px_8px_10px_0px_rgba(var(--secondary-rgb),0.25)]",
		icon: "/assets/svg/icons/three-line-45.svg",
	},
	danger: {
		widget: "bg-[var(--danger)] shadow-[0px_8px_10px_0px_rgba(var(--danger-rgb),0.25)]",
		icon: "/assets/svg/icons/three-line-45.svg",
	},
	warning: {
		widget: "bg-[var(--warning)] shadow-[0px_8px_10px_0px_rgba(var(--warning-rgb),0.25)]",
		icon: "/assets/svg/icons/three-line-45.svg",
	},
} as const

/**
 * Laporan renders four across (`col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12`); the Tagihan
 * detail page renders three (`col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12`,
 * student-invoice/detail.blade.php:41-70). Both collapse to halves at sm and full at xs.
 */
const COLUMN = {
	4: "w-full px-[15px] min-[576px]:w-1/2 min-[992px]:w-1/4",
	3: "w-full px-[15px] min-[576px]:w-1/2 min-[992px]:w-1/3",
} as const

type LegacyInvoiceWidgetProps = {
	variant: keyof typeof VARIANT
	value: string | number
	label: string
	/** How many widgets share the row. Defaults to the four-across Laporan layout. */
	across?: keyof typeof COLUMN
}

// Port of `span.tbr_widget.tbr_widget-invoice[anim=ripple]` (public/assets/css/widget.css) inside its
// `col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12` column
const LegacyInvoiceWidget = ({ variant, value, label, across = 4 }: LegacyInvoiceWidgetProps): JSX.Element => (
	<div className={COLUMN[across]}>
		<span
			onClick={triggerRipple}
			className={cn(
				"mb-[16px] flex w-full flex-row flex-nowrap items-center rounded-[12px] py-[16px] pr-[16px] pl-[40px] text-[12px] leading-[16px] text-[var(--light)] transition-all duration-300 hover:shadow-none active:shadow-none",
				RIPPLE_CLASS,
				VARIANT[variant].widget,
			)}
		>
			<img src={VARIANT[variant].icon} alt="icon" className="absolute top-[-6px] left-[-6px] max-w-none" />
			<img src="/assets/svg/etc/Widget-Bg-Invoice.svg" alt="icon" className="absolute right-[-40px] bottom-[-50px] max-w-none" />
			<div>
				<div className="mt-[7px] mb-[8px] text-[20px] font-bold">{value}</div>
				<div>{label}</div>
			</div>
		</span>
	</div>
)

export default LegacyInvoiceWidget
