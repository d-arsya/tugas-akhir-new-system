import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

type AccountancyFieldLabelProps = {
	htmlFor: string
	badge: string
	tight?: boolean
	children: ReactNode
}

const AccountancyFieldLabel = ({ htmlFor, badge, tight = false, children }: AccountancyFieldLabelProps): JSX.Element => (
	<label htmlFor={htmlFor} className={cn("flex leading-[20px] min-[992px]:text-right", tight ? "m-0" : "mb-[8px]")}>
		{children}
		<span className="mb-[4px] ml-[8px] text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">
			{badge}
		</span>
	</label>
)

export default AccountancyFieldLabel
