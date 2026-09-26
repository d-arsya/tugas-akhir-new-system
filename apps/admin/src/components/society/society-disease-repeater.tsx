import type { JSX } from "react"

import type { SocietyDisease, SocietyFieldErrors } from "@roja/types"
import { SOCIETY_DISEASE_HISTORY, cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import { FieldError, SocietySelect, SocietyText, type SocietyLayout } from "./society-controls"

// Setting 28 — `identity.blade.php` (edit :268-489, wizard :196-310) + `edit-disease-history.js` /
// `create-disease-history.js`: up to 20 `div.tbr_disease_group` rows, the first one's ✕ inert.

// `.tbr_disease_group .form-group` (dynamic-form.css 14-20, 34-48): half the row minus the 40px ✕
const HALF =
	"w-[calc(50%-20px)] max-w-[calc(50%-20px)] min-w-[calc(50%-20px)] flex-[calc(50%-20px)] pr-[20px] max-[480px]:w-[calc(100%-40px)] max-[480px]:max-w-[calc(100%-40px)] max-[480px]:min-w-[calc(100%-40px)] max-[480px]:flex-[calc(100%-40px)]"

// `.tbr_btn-light-secondary` (app.css 660-664, 751-757)
const LIGHT_SECONDARY =
	"bg-[rgba(141,195,30,0.16)] text-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white focus:bg-[var(--secondary)] focus:text-white"

const RemoveIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<g opacity="0.7">
			<rect width="24" height="24" transform="translate(24 24) rotate(180)" fill="#f64e60" opacity="0" />
			{/* `.tbr_disease_group .btn:hover svg path { fill: #FFFFFF }` */}
			<path
				className="fill-[#f64e60] group-hover:fill-white group-focus:fill-white"
				d="M13.41,12l4.3-4.29a1,1,0,1,0-1.42-1.42L12,10.59,7.71,6.29A1,1,0,0,0,6.29,7.71L10.59,12l-4.3,4.29a1,1,0,1,0,1.42,1.42L12,13.41l4.29,4.3a1,1,0,1,0,1.42-1.42Z"
			/>
		</g>
	</svg>
)

type SocietyDiseaseRepeaterProps = {
	layout: SocietyLayout
	/** `getInputLabel($setting_forms, 28)` — shown without the required/optional text. */
	label: string
	diseases: SocietyDisease[]
	onChange: (next: SocietyDisease[]) => void
	errors: SocietyFieldErrors
	disabled: boolean
}

const SocietyDiseaseRepeater = ({ layout, label, diseases, onChange, errors, disabled }: SocietyDiseaseRepeaterProps): JSX.Element => {
	// `@forelse … @empty`: no history still renders one blank row
	const rows = diseases.length > 0 ? diseases : [{ name: "", status: "" }]
	const setRow = (index: number, patch: Partial<SocietyDisease>): void =>
		onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))

	return (
		// `div.row.justify-content-center > div.col-12` (edit) / `div.col-xl-10.col-lg-10.col-md-12` (wizard)
		<div className="mx-[-15px] flex flex-wrap justify-center">
			<div className={cn("w-full px-[15px]", layout === "horizontal" && "min-[992px]:w-10/12")}>
				<div className={layout === "horizontal" ? "text-center" : "text-left"}>
					<p className="mt-0 mb-[8px] leading-[24px]">{label}</p>
				</div>
				<div>
					{rows.map((row, index) => {
						const nameKey = `disease_name.${index}`
						const statusKey = `disease_status.${index}`
						const inert = index === 0 || disabled
						return (
							<div key={index} id={`element_${index}`} className="flex flex-wrap">
								<div className={cn("mb-[4px]", HALF)}>
									<SocietyText
										name="disease_name[]"
										id={`disease_name_${index}`}
										value={row.name}
										onChange={(name) => setRow(index, { name })}
										placeholder={SOCIETY_DISEASE_HISTORY.namePlaceholder}
										disabled={disabled}
										invalid={errors[nameKey] !== undefined}
									/>
									<FieldError message={errors[nameKey]} />
								</div>
								<div className={cn("mb-[16px]", HALF)}>
									{/* `<option selected value="">Select</option>` has no `title`, so it is not greyed */}
									<SocietySelect
										id={`disease_status_${index}`}
										value={row.status}
										options={SOCIETY_DISEASE_HISTORY.statusOptions}
										placeholder="Select"
										mutedPlaceholder={false}
										onChange={(status) => setRow(index, { status })}
										disabled={disabled}
										invalid={errors[statusKey] !== undefined}
									/>
									<FieldError message={errors[statusKey]} />
								</div>
								{/* `button.btn.tbr_btn.tbr_btn-light-danger.p-0` + `.tbr_disabled` (first row / portal row) or `.remove` */}
								<button
									type="button"
									aria-label="Hapus penyakit"
									aria-disabled={inert}
									onMouseDown={triggerRipple}
									onClick={() => {
										if (inert) return
										onChange(rows.filter((_, i) => i !== index))
									}}
									className={legacyButtonClass(
										"light-danger",
										cn(
											"group h-[40px] w-[40px] max-w-[40px] min-w-[40px] flex-[40px] p-0",
											RIPPLE_CLASS,
											inert && "pointer-events-none cursor-default opacity-50",
										),
									)}
								>
									<RemoveIcon />
								</button>
							</div>
						)
					})}
				</div>
				<div className="pt-[8px] text-center">
					<button
						type="button"
						disabled={disabled}
						onMouseDown={triggerRipple}
						onClick={() => {
							// `if (total_element < max)` with no else
							if (rows.length < SOCIETY_DISEASE_HISTORY.maxRows) onChange([...rows, { name: "", status: "" }])
						}}
						className={legacyButtonClass("light", cn("inline-block", LIGHT_SECONDARY, RIPPLE_CLASS))}
					>
						{SOCIETY_DISEASE_HISTORY.addButtonLabel}
					</button>
				</div>
			</div>
		</div>
	)
}

export default SocietyDiseaseRepeater
