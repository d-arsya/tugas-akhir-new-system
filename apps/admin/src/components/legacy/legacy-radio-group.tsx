import { Fragment, type JSX } from "react"

import { cn } from "@roja/utils"

export type LegacyRadioOption = { value: string; label: string; id?: string }

type LegacyRadioGroupProps = {
	name: string
	value: string
	options: LegacyRadioOption[]
	onChange: (value: string) => void
	inline?: boolean
	/**
	 * On the wrapping row. `inline` ships bootstrap's `.custom-control-inline` box, but some
	 * blades use `.form-check-inline` instead, which adds `align-items: center`.
	 */
	className?: string
	/**
	 * On each radio. `cn` is tailwind-merge, so this **replaces** the matching defaults rather
	 * than fighting them — the Akun blades write their own gap per item (`mr-4`, `mr-2`) and no
	 * top margin, i.e. `itemClassName="mt-0 mr-[24px] last:mr-0"`.
	 */
	itemClassName?: string
}

// Port of `.custom-control.custom-radio` (bootstrap 4 base + public/assets/css/form.css ~240-350):
// the 20px disc is `label::before` on `--bg-primary` (`--secondary` when checked) and the 8px dot is `label::after`
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
							// `.custom-control-inline` sits in a row; stacked radios use `.mb-2` between them
							inline ? "mt-[8px] mr-[16px] inline-flex" : index < options.length - 1 && "mb-[8px]",
							itemClassName,
						)}
					>
						{/* globals.css styles bare `input[type=radio]` with `!important`, so the real input is
						    boxed into the `.custom-control-input` slot instead of being restyled */}
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
					{/* Blades whose radios sit in a block container keep the newline between them as a real
					    3.73px text node. A flex wrapper discards it, which is right for `.form-check-inline`;
					    emitting it lets a consumer that overrides the wrapper to `block` match legacy. */}
					{inline && index < options.length - 1 ? " " : null}
				</Fragment>
			)
		})}
	</div>
)

export default LegacyRadioGroup
