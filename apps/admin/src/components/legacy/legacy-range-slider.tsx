import type { JSX } from "react"

import { cn } from "@roja/utils"

import { rupiahLabel } from "@/lib/legacy-format"

type LegacyRangeSliderProps = {
	id: string
	value: number
	max: number
	step: number
	onChange: (value: number) => void
	name?: string
	disabled?: boolean
	className?: string
}

const LegacyRangeSlider = ({
	id,
	value,
	max,
	step,
	onChange,
	name,
	disabled,
	className,
}: LegacyRangeSliderProps): JSX.Element => {
	const percent = max > 0 ? Math.min(100, Math.max(0, (100 * value) / max)) : 0

	return (
		<div className={cn("mb-[4px]", className)}>
			<div className="my-[8px] flex justify-between">
				<span>Rp 0</span>
				<span>{rupiahLabel(max)}</span>
			</div>

			<div className="relative">
				<input
					type="range"
					id={id}
					{...(name === undefined ? {} : { name })}
					min={0}
					max={max}
					step={step}
					value={value}
					disabled={disabled === true}
					onChange={(event) => onChange(Number(event.target.value))}
					className="w-full cursor-pointer opacity-0"
				/>
				<div className="pointer-events-none absolute top-1/2 h-[5px] w-full -translate-y-1/2 bg-[#DDDDDD]">
					<div className="h-full bg-[#DCEDBB]" style={{ width: `${percent}%` }} />
				</div>
				<div
					className="pointer-events-none absolute top-1/2 h-[20px] w-[20px] rounded-full bg-[var(--secondary)]"
					style={{ left: `${percent}%`, transform: `translate(-${percent}%, -50%)` }}
				/>
			</div>

			<div className="mt-[16px]">
				<span>Nilai yang disanggupi: </span>
				<span className="rangeval font-bold">{rupiahLabel(value)}</span>
			</div>
		</div>
	)
}

export default LegacyRangeSlider
