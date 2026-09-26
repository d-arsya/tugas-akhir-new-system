import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

type AcademicFieldProps = {
	label: ReactNode
	htmlFor?: string
	hint?: "required" | "optional"
	className?: string
	children: ReactNode
}

const AcademicField = ({ label, htmlFor, hint, className, children }: AcademicFieldProps): JSX.Element => (
	<div className={cn("mb-[16px]", className)}>
		<label htmlFor={htmlFor} className="m-0 flex leading-[20px]">
			{label}
			{hint ? (
				<span className="m-0 mb-[4px] ml-[8px] p-0 text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">
					{hint}
				</span>
			) : null}
		</label>
		{children}
	</div>
)

export default AcademicField
