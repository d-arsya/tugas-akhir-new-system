import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

type LegacyCheckboxProps = {
	id: string
	checked: boolean
	onChange: (checked: boolean) => void
	label: ReactNode
	description?: ReactNode
	disabled?: boolean
	name?: string
	className?: string
}

const CheckMark = (): JSX.Element => (
	<svg
		aria-hidden="true"
		width="13.8"
		height="10.36"
		viewBox="0 0 14.521 10.902"
		className="pointer-events-none absolute top-[4.82px] left-[-20.9px] block"
	>
		<path
			d="M9.3,16.859a.905.905,0,0,1-.661-.29l-4.4-4.68a.906.906,0,1,1,1.322-1.24L9.3,14.623l7.613-8.328a.905.905,0,1,1,1.34,1.213L9.974,16.56a.905.905,0,0,1-.661.3Z"
			transform="translate(-3.999 -5.956)"
			fill="#fff"
		/>
	</svg>
)

const LegacyCheckbox = ({
	id,
	checked,
	onChange,
	label,
	description,
	disabled = false,
	name,
	className,
}: LegacyCheckboxProps): JSX.Element => (
	<div className={cn("relative z-[1] min-h-[24px] pl-[24px]", className)}>
		<input
			type="checkbox"
			id={id}
			name={name}
			checked={checked}
			disabled={disabled}
			onChange={(event) => onChange(event.target.checked)}
			className="absolute left-0 z-[-1] h-[20px] w-[16px] opacity-0"
		/>
		<label
			htmlFor={id}
			className={cn("relative mb-0 block pl-[8px] align-top", disabled ? "cursor-default text-[#6c757d]" : "cursor-pointer")}
		>
			<span
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute top-0 left-[-24px] block h-[20px] w-[20px] rounded-[4px]",
					disabled ? "bg-[#eeeeee]" : checked ? "bg-[var(--secondary)]" : "bg-[var(--bg-primary)]",
				)}
			/>
			{checked ? <CheckMark /> : null}
			{label}
			{description !== undefined ? <p className="mb-0 text-[var(--grey)]">{description}</p> : null}
		</label>
	</div>
)

export default LegacyCheckbox
