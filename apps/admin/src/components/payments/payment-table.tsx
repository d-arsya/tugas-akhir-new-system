import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

// Transcribed from `assets/css/student-invoice/custom.css` (the Buat Pembayaran page) and
// `custom-detail.css` (the Detail Pembayaran page). The two files are the same rules twice over,
// with two differences that are kept here rather than smoothed away:
//   * `.table-style` is `overflow: hidden` on the create page and `overflow: auto` on the detail
//     page, so only the detail page scrolls its tables sideways on a narrow screen;
//   * `.cost-table tr td` draws its top border in `#f9f9f9` on the detail page and `#F7F7F7` on
//     the create page — a one-shade difference that is invisible but real.
//
// Neither `<table>` carries a Bootstrap class, so none of Bootstrap's table styling applies and
// these rules are the whole appearance.

/** `table tr th`: the header band, `font-weight: normal`, 12px/20px padding, no bottom border. */
export const TH_CLASS = "bg-[#F7F7F7] px-[20px] py-[12px] text-left font-normal"

/** `.text-weight-600` — the 600 weight the blades add per cell. */
export const TH_BOLD_CLASS = cn(TH_CLASS, "font-semibold")

/** `tr td` / `.cost-table tr td`: 12px/20px padding and a 2px top border, no other edges. */
export const tdClass = (variant: "create" | "detail"): string =>
	cn("px-[20px] py-[12px] border-t-2 border-r-0 border-b-0 border-l-0", {
		"border-t-[#F7F7F7]": variant === "create",
		"border-t-[#f9f9f9]": variant === "detail",
	})

type PaymentTableProps = {
	variant: "create" | "detail"
	head: ReactNode
	children: ReactNode
	foot?: ReactNode
	className?: string
}

/**
 * `.table-style > table`. The wrapper carries the radius and the 2px `#F7F7F7` frame; clipping it
 * is what rounds the header band's corners, since the band is painted by the `th` themselves.
 */
const PaymentTable = ({ variant, head, children, foot, className }: PaymentTableProps): JSX.Element => (
	<div
		className={cn(
			"mb-[20px] rounded-[10px] border-2 border-[#F7F7F7] bg-[#F7F7F7]",
			variant === "create" ? "overflow-hidden" : "overflow-auto",
			className,
		)}
	>
		<table className="mb-0 w-full border-collapse">
			{/* `table thead tr { background-color: #F7F7F7 }` */}
			<thead>
				<tr className="bg-[#F7F7F7]">{head}</tr>
			</thead>
			{/* `table tbody tr { background-color: #FFFFFF }` */}
			<tbody className="[&_tr]:bg-white">{children}</tbody>
			{foot === undefined ? null : <tfoot>{foot}</tfoot>}
		</table>
	</div>
)

export default PaymentTable
