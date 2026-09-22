import type { JSX } from "react"

import { cn } from "@roja/utils"

import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

const VARIANT = {
	primary: {
		widget: "bg-[var(--primary)] shadow-[0px_8px_10px_0px_rgba(228,0,126,0.25)]",
		icon: "/assets/svg/icons/dollar-s.svg",
	},
	secondary: {
		widget: "bg-[var(--secondary)] shadow-[0px_8px_10px_0px_rgba(141,195,30,0.25)]",
		icon: "/assets/svg/icons/three-line-45.svg",
	},
} as const

type LegacyInvoiceWidgetProps = {
	variant: keyof typeof VARIANT
	value: string | number
	label: string
}

// Port of `span.tbr_widget.tbr_widget-invoice[anim=ripple]` (public/assets/css/widget.css) inside its
// `col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12` column
const LegacyInvoiceWidget = ({ variant, value, label }: LegacyInvoiceWidgetProps): JSX.Element => (
	<div className="w-full px-[15px] min-[576px]:w-1/2 min-[992px]:w-1/4">
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
