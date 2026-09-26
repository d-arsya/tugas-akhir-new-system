import type { JSX, TextareaHTMLAttributes } from "react"

import { cn } from "@roja/utils"

import { legacyControlClass, legacyControlLockedClass } from "./legacy-input"

type LegacyTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { noResize?: boolean }

const LegacyTextarea = ({ noResize = false, className, ...props }: LegacyTextareaProps): JSX.Element => (
	<textarea
		{...props}
		className={cn(
			legacyControlClass,
			"h-auto align-top",
			noResize && "resize-none",
			(props.readOnly === true || props.disabled === true) && legacyControlLockedClass,
			className,
		)}
	/>
)

export default LegacyTextarea
