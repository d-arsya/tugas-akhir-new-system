import { Fragment, type JSX } from "react"

import { cn } from "@roja/utils"

export type LegacyRadioOption = { value: string; label: string; id?: string }

type LegacyRadioGroupProps = {
	name: string
	value: string
	options: LegacyRadioOption[]
	onChange: (value: string) => void
	inline?: boolean
	className?: string
	itemClassName?: string
}

const LegacyRadioGroup = ({
	name,
	value,
	options,
	onChange,
	inline = false,
	className,
	itemClassName,
}: LegacyRadioGroupProps): JSX.Element => (
	<div className={cn(inline && "flex flex-wrap", className)}>
		{options.map((option, index) => {
			const id = option.id ?? `${name}-${option.value}`
			const checked = option.value === value
			return (
				<Fragment key={option.value}>
					<div
						className={cn(
							"relative z-[1] min-h-[24px] pl-[24px]",
							inline ? "mt-[8px] mr-[16px] inline-flex" : index < options.length - 1 && "mb-[8px]",
							itemClassName,
						)}
					>
						<span className="absolute top-0 left-0 z-[-1] block h-[20px] w-[16px] overflow-hidden opacity-0">
							<input
								type="radio"
								id={id}
								name={name}
								value={option.value}
								checked={checked}
								onChange={() => onChange(option.value)}
							/>
						</span>
						<label htmlFor={id} className="relative mb-0 inline-block cursor-pointer pt-[1px] pl-[8px] align-top">
							<span
								aria-hidden="true"
								className={cn(
									"pointer-events-none absolute top-[1px] left-[-24px] block h-[20px] w-[20px] rounded-full",
									checked ? "bg-[var(--secondary)]" : "bg-[var(--bg-primary)]",
								)}
							/>
							{checked ? (
								<span aria-hidden="true" className="absolute top-[7px] left-[-18px] block h-[8px] w-[8px] rounded-[8px] bg-[var(--bg-form)]" />
							) : null}
							{option.label}
						</label>
					</div>
					{inline && index < options.length - 1 ? " " : null}
				</Fragment>
			)
		})}
	</div>
)

export default LegacyRadioGroup
