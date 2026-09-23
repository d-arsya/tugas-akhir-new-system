import type { JSX, TextareaHTMLAttributes } from "react"

import { cn } from "@roja/utils"

import { legacyControlClass, legacyControlLockedClass } from "./legacy-input"

type LegacyTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { noResize?: boolean }

// `textarea.form-control` (form.css 31-80) + `.tbr_disables_resizing` (form.css 124-126)
const LegacyTextarea = ({ noResize = false, className, ...props }: LegacyTextareaProps): JSX.Element => (
	<textarea
		{...props}
		className={cn(
			legacyControlClass,
			// Bootstrap reboot keeps textareas from inheriting the inline vertical alignment
			"h-auto align-top",
			noResize && "resize-none",
			(props.readOnly === true || props.disabled === true) && legacyControlLockedClass,
			className,
		)}
	/>
)

export default LegacyTextarea
