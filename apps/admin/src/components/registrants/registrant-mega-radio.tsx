import type { JSX } from "react"

import { cn } from "@roja/utils"

export type MegaRadioOption = { id: string; value: string; title: string; description: string; className?: string }

type RegistrantMegaRadioProps = {
	name: string
	value: string
	options: MegaRadioOption[]
	onChange: (value: string) => void
	inline?: boolean
}

const RegistrantMegaRadio = ({ name, value, options, onChange, inline = false }: RegistrantMegaRadioProps): JSX.Element => (
	<div className={cn(inline && "flex flex-wrap")}>
		{options.map((option) => {
			const checked = option.value === value
			return (
				<div
					key={option.id}
					className={cn(
						"relative mt-[18px] mr-[20px] mb-[32px] flex w-full min-w-full pl-[24px] last:mr-0 max-[480px]:last:mb-[18px]",
						inline && "min-[480px]:w-[47%] min-[480px]:min-w-[47%]",
						option.className,
					)}
				>
					<span className="absolute top-0 left-0 z-[-1] block h-[20px] w-[16px] overflow-hidden opacity-0">
						<input type="radio" id={option.id} name={name} value={option.value} checked={checked} onChange={() => onChange(option.value)} />
					</span>
					<label htmlFor={option.id} className="relative mb-0 inline-block w-full cursor-pointer px-[15px] align-top">
						<span
							aria-hidden="true"
							className={cn(
								"pointer-events-none absolute top-[2px] left-[-26px] z-[1] block h-[24px] w-[24px] rounded-full",
								checked ? "bg-[var(--secondary)]" : "bg-[var(--bg-form-border)]",
							)}
						/>
						{checked ? (
							<span aria-hidden="true" className="absolute top-[9px] left-[-19px] z-[1] block h-[10px] w-[10px] rounded-full bg-[var(--bg-form)]" />
						) : null}
						<p className="mt-0 mb-[4px] leading-[24px] font-semibold">{option.title}</p>
						<p className="m-0 leading-[24px] text-[var(--grey)] italic">{option.description}</p>
						<span
							aria-hidden="true"
							className={cn(
								"pointer-events-none absolute top-[-18px] right-0 left-[-15px] h-[calc(100%+36px)] w-[calc(100%+15px)] rounded-[10px] border-2 bg-transparent",
								checked ? "border-[var(--secondary)]!" : "border-[var(--bg-form-border)]!",
							)}
						/>
					</label>
				</div>
			)
		})}
	</div>
)

export default RegistrantMegaRadio
