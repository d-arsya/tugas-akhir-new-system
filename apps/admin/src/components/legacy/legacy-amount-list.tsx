import type { JSX } from "react"

import { cn } from "@roja/utils"

import { legacyButtonClass } from "./legacy-button"
import LegacyCurrencyInput from "./legacy-currency-input"

/**
 * The "Tambah Item" repeater on the Biaya Santri cost-term form —
 * `student-cost-term/create.blade.php` 96-126 plus `assets/js/student-cost/create-option.js`.
 *
 * The geometry is `dynamic-form.css` 50-89, not a flex row with a margin:
 *
 *   .tbr_option_group            { display: flex; flex-wrap: wrap }
 *   .tbr_option_group .form-group{ flex/width/min/max: calc(90% - 20px); padding-right: 20px }
 *   .tbr_option_group .btn       { flex/width/height/min/max: 40px }
 *   @media (max-width: 480px)    { …form-group:nth-child(1) → calc(100% - 40px) }
 *
 * so the 20px gap is the field's own padding and the ✕ is a fixed 40px box. The media query is
 * written `:nth-child(1)`, which every row's form-group satisfies — it is not first-row-only.
 *
 * Legacy quirks kept:
 *  - the cap is silent. `create-option.js` wraps the whole append in `if (total_element < max)`
 *    with no `else`, so at 20 rows "Tambah Item" simply does nothing — it is never greyed out.
 *  - "Tambah Item" is `<a type="button">` with no href.
 *  - the first row's ✕ carries `.tbr_disabled` (`opacity: .5 !important; pointer-events: none`,
 *    app.css 468 — which outranks `.tbr_btn.tbr_disabled`'s `.4` in dynamic-form.css) and has
 *    neither the `.remove` class nor an id, so it is inert twice over. The list cannot empty
 *    itself. Note it is *not* given the `disabled` attribute, exactly as with `.tbr_bulk_action`.
 */
type LegacyAmountListProps = {
	/** Masked values; always at least one entry. */
	values: string[]
	onChange: (values: string[]) => void
	max?: number
	addLabel?: string
	prefix?: string
	disabled?: boolean
}

// Legacy's own close glyph, `<g opacity="0.7">` and all. `fill` is `currentColor` rather than the
// literal `#f64e60` so that `.tbr_option_group .btn:hover svg path { fill: #FFFFFF }`
// (dynamic-form.css 71-75) falls out of the button's own hover colour.
const RemoveIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<g opacity="0.7">
			<rect width="24" height="24" transform="translate(24 24) rotate(180)" fill="currentColor" opacity="0" />
			<path
				d="M13.41,12l4.3-4.29a1,1,0,1,0-1.42-1.42L12,10.59,7.71,6.29A1,1,0,0,0,6.29,7.71L10.59,12l-4.3,4.29a1,1,0,1,0,1.42,1.42L12,13.41l4.29,4.3a1,1,0,1,0,1.42-1.42Z"
				fill="currentColor"
			/>
		</g>
	</svg>
)

const LegacyAmountList = ({
	values,
	onChange,
	max = 20,
	addLabel = "Tambah Item",
	prefix = "Rp",
	disabled = false,
}: LegacyAmountListProps): JSX.Element => {
	const rows = values.length > 0 ? values : [""]

	const setAt = (index: number, next: string): void => {
		onChange(rows.map((entry, i) => (i === index ? next : entry)))
	}

	const add = (): void => {
		// `if (total_element < max)` with no else — over the cap the click is simply swallowed
		if (disabled || rows.length >= max) return
		onChange([...rows, ""])
	}

	return (
		<>
			{rows.map((entry, index) => (
				// `div.tbr_option_group#element_{n}`
				<div key={index} className="flex flex-wrap">
					{/* `.form-group.mb-1`, sized by `.tbr_option_group .form-group` */}
					<div className="mb-[4px] w-[calc(90%-20px)] max-w-[calc(90%-20px)] min-w-[calc(90%-20px)] flex-[calc(90%-20px)] pr-[20px] max-[480px]:w-[calc(100%-40px)] max-[480px]:max-w-[calc(100%-40px)] max-[480px]:min-w-[calc(100%-40px)] max-[480px]:flex-[calc(100%-40px)]">
						{/* `.input-group.tbr_fix_ig` */}
						<div className="relative flex w-full flex-wrap items-stretch">
							{/* `div.input-group-prepend.tbr_text-grey` — form.css 195-205, 42px wide via `.tbr_fix_ig` */}
							<div className="mr-[-2px] flex h-[40px] w-[42px] shrink-0 items-center justify-center rounded-l-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[12px] py-[4px] text-[var(--grey)]">
								{prefix}
							</div>
							{/*
							 * `.input-group > .form-control` is bootstrap's `flex: 1 1 auto; width: 1%;
							 * min-width: 0`. Without it `legacyControlClass`'s `block w-full` survives
							 * `cn` and the input claims the whole row, wrapping the `Rp` prepend onto a
							 * line of its own — the group is `flex-wrap`.
							 */}
							<LegacyCurrencyInput
								value={entry}
								onChange={(next) => setAt(index, next)}
								disabled={disabled}
								className="relative w-[1%] min-w-0 flex-auto rounded-l-none focus:z-[3]"
							/>
						</div>
					</div>

					{/* `button.btn.tbr_btn.tbr_btn-light-danger.p-0`, forced to 40×40 by the group */}
					<button
						type="button"
						aria-label={`Hapus biaya ke ${index + 1}`}
						aria-disabled={disabled || index === 0}
						onClick={() => {
							if (disabled || index === 0) return
							onChange(rows.filter((_, i) => i !== index))
						}}
						className={legacyButtonClass(
							"light-danger",
							cn(
								"h-[40px] w-[40px] max-w-[40px] min-w-[40px] flex-[40px] p-0",
								// `.tbr_disabled` — CSS-only, no `disabled` attribute
								(disabled || index === 0) && "pointer-events-none cursor-default opacity-50",
							),
						)}
					>
						<RemoveIcon />
					</button>
				</div>
			))}

			{/* `div.text-center.pt-2 > a.tbr_add_option` */}
			<div className="pt-[8px] text-center">
				<a
					role="button"
					tabIndex={0}
					onClick={add}
					onKeyDown={(event) => {
						if (event.key !== "Enter" && event.key !== " ") return
						event.preventDefault()
						add()
					}}
					className="cursor-pointer text-[12px] text-[var(--primary)]"
				>
					{addLabel}
				</a>
			</div>
		</>
	)
}

export default LegacyAmountList
