import type { JSX } from "react"

import { cn } from "@roja/utils"

import { rupiahLabel } from "@/lib/legacy-format"

/**
 * The "kesanggupan" amount slider from the Kesanggupan edit modals
 * (`student-capability/partials/modal-edit-capability*.blade.php`, the `type == 'maximum'`
 * branch), driven by `assets/js/student-capability/range.js` and styled by
 * `app.css:3049-3089`.
 *
 * It is **not** a plugin — legacy hides a native `<input type="range">` with `opacity: 0`
 * and paints its own 5px track and 20px thumb underneath, both `pointer-events: none` so
 * every gesture still reaches the real input. That is reproduced here rather than swapped
 * for a component library, so keyboard, touch and screen-reader behaviour stay native.
 *
 * The three legacy modals differ only in `step`, `max` and the starting `value`
 * (mass-create uses `min(masterAmount, 5000)` as its step while the other two hardcode
 * 5000), so all three travel as props.
 *
 * `app.css` also carries `.range::-ms-tooltip { display: none }`, which targets the
 * pre-Chromium Edge slider tooltip. It is deliberately not ported — no supported browser
 * renders it.
 */
type LegacyRangeSliderProps = {
	id: string
	/** Rupiah, not masked. Legacy starts a fresh row at `max`. */
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
	// `range.js` computes `(100 * value) / max`, which is NaN when a cost term has no
	// amount — legacy then writes "NaN%" into the style and the thumb disappears.
	const percent = max > 0 ? Math.min(100, Math.max(0, (100 * value) / max)) : 0

	return (
		<div className={cn("mb-[4px]", className)}>
			{/* `.d-flex.justify-content-between.my-2` — the 0 / ceiling captions */}
			<div className="my-[8px] flex justify-between">
				<span>Rp 0</span>
				<span>{rupiahLabel(max)}</span>
			</div>

			{/* `.tbr_max_amount_range` — `position: relative` */}
			<div className="relative">
				{/* `.range.form-control-range` — full width, transparent, still the real control */}
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
				{/* `.track` — 5px #DDDDDD bar, centred, click-through */}
				<div className="pointer-events-none absolute top-1/2 h-[5px] w-full -translate-y-1/2 bg-[#DDDDDD]">
					{/* `.track-inner` — #DCEDBB fill */}
					<div className="h-full bg-[#DCEDBB]" style={{ width: `${percent}%` }} />
				</div>
				{/* `.thumb` — 20px circle in `var(--secondary)`; `range.js` sets both `left` and
				    the negative translate so the thumb stays inside the track at either end */}
				<div
					className="pointer-events-none absolute top-1/2 h-[20px] w-[20px] rounded-full bg-[var(--secondary)]"
					style={{ left: `${percent}%`, transform: `translate(-${percent}%, -50%)` }}
				/>
			</div>

			{/* `.mt-3` — the live readout `edit-amount.js` keeps in step with the input */}
			<div className="mt-[16px]">
				<span>Nilai yang disanggupi: </span>
				<span className="rangeval font-bold">{rupiahLabel(value)}</span>
			</div>
		</div>
	)
}

export default LegacyRangeSlider
