import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

type AcademicYearFieldProps = {
	label: string
	htmlFor: string
	/** `<span class="help-block ml-2">` inside the label */
	hint: "required" | "optional"
	/** `<span class="help-block tbr_text-grey">` under the control */
	help?: ReactNode
	className?: string
	children: ReactNode
}

/**
 * The stacked `.form-group` the Tahun Ajaran form uses, as opposed to `<LegacyFormRow>`'s
 * horizontal `.form-group.row`: `label.control-label.text-lg-right.d-flex.m-0` (form.css 6-19)
 * with the hint inline, then the control, then an optional `.help-block` (theme.css 11101-11108).
 */
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
