import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

type AcademicYearFieldProps = {
	label: string
	htmlFor: string
	hint: "required" | "optional"
	help?: ReactNode
	className?: string
	children: ReactNode
}

const AcademicYearField = ({ label, htmlFor, hint, help, className, children }: AcademicYearFieldProps): JSX.Element => (
	<div className={cn("mb-[16px]", className)}>
		<label htmlFor={htmlFor} className="m-0 flex leading-[20px] font-medium">
			{label}
			<span className="m-0 mb-[4px] ml-[8px] p-0 text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">
				{hint}
			</span>
		</label>
		{children}
		{help === undefined ? null : (
			<span className="mt-[5px] mb-[10px] block text-[12px] text-[var(--grey)]!">{help}</span>
		)}
	</div>
)

export default AcademicYearField
