import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

export const TH_CLASS = "bg-[#F7F7F7] px-[20px] py-[12px] text-left font-normal"

export const TH_BOLD_CLASS = cn(TH_CLASS, "font-semibold")

export const TD_CLASS = "px-[20px] py-[12px] border-t-2 border-r-0 border-b-0 border-l-0 border-t-[#F7F7F7]"

type PaymentTableProps = {
	head: ReactNode
	children: ReactNode
	foot?: ReactNode
	className?: string
}

const PaymentTable = ({ head, children, foot, className }: PaymentTableProps): JSX.Element => (
	<div className={cn("mb-[20px] rounded-[10px] border-2 border-[#F7F7F7] bg-[#F7F7F7] overflow-hidden", className)}>
		<table className="mb-0 w-full border-collapse">
			<thead>
				<tr className="bg-[#F7F7F7]">{head}</tr>
			</thead>
			<tbody className="[&_tr]:bg-white">{children}</tbody>
			{foot === undefined ? null : <tfoot>{foot}</tfoot>}
		</table>
	</div>
)

export default PaymentTable
