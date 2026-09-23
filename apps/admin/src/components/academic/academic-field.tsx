import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

type AcademicFieldProps = {
	label: ReactNode
	htmlFor?: string
	/** `<span class="help-block ml-2">required|optional</span>`, inline after the label text. */
	hint?: "required" | "optional"
	className?: string
	children: ReactNode
}

/**
 * The stacked `.form-group` the Akademik pages use: label on its own line with the help-block
 * beside it, control underneath. Unlike the kit's `LegacyFormRow` (`.form-group.row` with a
 * `col-lg-*` label column and the hint stacked below), these blades write
 * `label.control-label.text-lg-right.d-flex.m-0 + span.help-block.ml-2`.
 *
 * Shared by the Jurusan form and the three Akademik edit modals; a candidate for the kit.
 */
const AcademicField = ({ label, htmlFor, hint, className, children }: AcademicFieldProps): JSX.Element => (
	// Bootstrap `.form-group` — 16px bottom margin unless the blade overrides it with mb-1/mb-2
	<div className={cn("mb-[16px]", className)}>
		<label htmlFor={htmlFor} className="m-0 flex leading-[20px]">
			{label}
			{hint ? (
				// `.form-group .control-label .help-block` (form.css 11-19) + `.ml-2`
				<span className="m-0 mb-[4px] ml-[8px] p-0 text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">
					{hint}
				</span>
			) : null}
		</label>
		{children}
	</div>
)

export default AcademicField
