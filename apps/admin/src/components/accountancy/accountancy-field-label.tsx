import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

/**
 * `label.control-label.text-lg-right.d-flex` + its `span.help-block.ml-2` badge
 * (`public/assets/css/form.css` 6-19): 20px line height, an 11px grey badge at .8 opacity.
 *
 * The create form's labels keep bootstrap's 8px `label { margin-bottom: .5rem }`; the edit
 * modal's carry `m-0` as well, which is what `tight` reproduces.
 */
type AccountancyFieldLabelProps = {
	htmlFor: string
	/** "required" or "optional" — legacy prints one on every field of these forms. */
	badge: string
	/** The edit modal's `label.control-label.text-lg-right.d-flex.m-0`. */
	tight?: boolean
	children: ReactNode
}

const AccountancyFieldLabel = ({ htmlFor, badge, tight = false, children }: AccountancyFieldLabelProps): JSX.Element => (
	<label htmlFor={htmlFor} className={cn("flex leading-[20px] min-[992px]:text-right", tight ? "m-0" : "mb-[8px]")}>
		{children}
		{/*
		 * `margin: 0 0 4px 0` (form.css 14) is load-bearing: the label is `d-flex`, so the badge's
		 * margin box sets the row height and the whole label stands 24px tall rather than 20px.
		 * Dropping it moves every control below it up by 4px, and the error compounds down the form.
		 */}
		<span className="mb-[4px] ml-[8px] text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">
			{badge}
		</span>
	</label>
)

export default AccountancyFieldLabel
