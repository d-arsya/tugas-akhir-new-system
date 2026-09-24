import { useEffect, useState, type JSX } from "react"
import type { CapabilityPeriodLabel } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacyRangeSlider from "@/components/legacy/legacy-range-slider"
import { rupiahLabel } from "@/lib/legacy-format"

/**
 * **The** "Edit item kesanggupan" modal — one component for all three legacy blades:
 * `student-capability/partials/modal-edit-capability.blade.php` (mass-create),
 * `…-item.blade.php` (level 5) and `…-mass-edit.blade.php` (mass-edit).
 *
 * The three differ only in the numbers they seed the control with — `step`, `max`, the
 * starting `value`, the `type` and the radio `options` — and every one of those is already
 * a field on `CapabilityItemRow`, so they travel as props and the markup is written once.
 * (`maxAmount` → `max`, `amount` → `value`; `step` and `type` and `options` keep their names.)
 *
 * Two cosmetic legacy differences are deliberately **not** carried as props:
 *  - `…-item.blade.php:41` writes the left caption as `RP 0` where the other two write
 *    `Rp 0`. That is a typo in one blade; all three render `Rp 0` here, which is also what
 *    `LegacyRangeSlider` already hardcodes.
 *  - `…-item.blade.php:43` captions the right-hand ceiling with
 *    `accountancy->getStudentCostMaxAmount($ay)` while its slider `max` is
 *    `studentCosts->first()->amount`, so the number above the track can disagree with the
 *    number the track actually stops at. The caption follows `max` here.
 *
 * `Batal` discards the draft. Legacy's mass-create variant instead ran
 * `.tbr_dismiss_amount` (`edit-amount.js:33-46`), which reset the hidden `amount[]` input to
 * its `max` (or unchecked the radio) while leaving the table cell showing the old figure —
 * so cancelling silently changed what the form would post. There is no draft/committed split
 * to reproduce once the row state lives in React, and reproducing the reset would mean
 * cancelling an edit could raise an amount the operator had lowered.
 */
type CapabilityAmountModalProps = {
	open: boolean
	/** `accountancy.name` — the header's right-hand caption and the field label. */
	name: string | null
	/** `StudentCostTerm::getTranslatePeriodAttribute` — the "(Bulanan)" / "(Sekali)" suffix. */
	periodLabel: CapabilityPeriodLabel
	/** `maximum` renders the slider, `option` the radio list. */
	type: "maximum" | "option"
	/** Slider ceiling (`CapabilityItemRow.maxAmount`). Null is treated as 0, as legacy's NaN was. */
	max: number | null
	/** Slider step (`CapabilityItemRow.step`) — `min(masterAmount, 5000)` on mass-create, else 5000. */
	step: number
	/** The amount the row holds (`CapabilityItemRow.amount`); null means nothing chosen yet. */
	value: number | null
	/** The selectable prices for `type='option'`; empty for `maximum`. */
	options: number[]
	onClose: () => void
	/** Null only ever comes back from an `option` row the operator left unpicked. */
	onSave: (amount: number | null) => void
}

const CapabilityAmountModal = ({
	open,
	name,
	periodLabel,
	type,
	max,
	step,
	value,
	options,
	onClose,
	onSave,
}: CapabilityAmountModalProps): JSX.Element => {
	const [draft, setDraft] = useState<number | null>(value)

	// magnificPopup tears the inline node down on close, so every reopen starts from the row
	useEffect(() => {
		if (open) setDraft(value)
	}, [open, value])

	const ceiling = max ?? 0
	const label = `${name ?? ""} (${periodLabel})`

	return (
		// `.modal-block-lg` is 900px and `.modal-block-sm` 400px (porto theme.css 13642-13652)
		<LegacyModalOverlay open={open} maxWidth={type === "maximum" ? "900px" : "400px"}>
			{/* `.tbr_custom_modal .card` — 20px radius, capped at the viewport (app.css 1880-1883) */}
			<section className="flex max-h-[calc(100vh-70px)] flex-col overflow-hidden rounded-[20px]">
				{/* `.card-header` — 68px, `--bg-tertiary`, title left and the account name right */}
				<header className="flex min-h-[68px] shrink-0 items-center justify-between rounded-t-[20px] border-0 bg-[var(--bg-tertiary)] px-[30px]">
					<h2 className="m-0! p-0! text-[16px]! leading-[18px]! font-semibold! tracking-normal! text-[var(--heading-txt-inverse)]!">
						Edit item kesanggupan
					</h2>
					<span className="text-right">{name}</span>
				</header>

				<div className="overflow-y-auto bg-[var(--bg-secondary)] p-[30px]">
					{type === "maximum" ? (
						/* `.form-group.mb-1` */
						<div className="mb-[4px]">
							{/* `<label class="control-label text-lg-right d-flex m-0">` — name bold, period plain */}
							<label htmlFor="capability-amount" className="m-0 flex">
								<span className="mr-[8px] font-bold">{name}</span> ({periodLabel})
							</label>
							<LegacyRangeSlider
								id="capability-amount"
								value={draft ?? 0}
								max={ceiling}
								step={step}
								onChange={setDraft}
							/>
						</div>
					) : (
						/* `.form-group` */
						<div className="mb-[16px]">
							<label htmlFor="capability-amount-0" className="m-0 font-bold">
								{label}
							</label>
							<p className="text-[var(--grey)]">
								Pilih salah satu opsi biaya sesuai dengan kesanggupan santri dalam membayar
							</p>
							{/* Legacy emits `<hr class="solid my-2">` before every radio and once more after the
							    last, so N options draw N+1 rules. `hr.solid` is porto theme.css 9424-9427:
							    `height: 0; border-bottom: 1px solid #ddd`, with `my-2` cutting the 22px margin to 8px. */}
							{options.map((option, index) => (
								// Two options may legitimately carry the same price, so the index is part of the key
								<div key={`${option}-${index}`}>
									<hr className="my-[8px] h-0 border-0 border-b border-solid border-[#ddd]" />
									<LegacyRadioGroup
										name="capability-amount"
										value={draft === null ? "" : String(draft)}
										onChange={(next) => setDraft(Number(next))}
										options={[
											{ value: String(option), label: rupiahLabel(option), id: `capability-amount-${index}` },
										]}
										itemClassName="mt-[8px] mb-0"
									/>
								</div>
							))}
							<hr className="my-[8px] h-0 border-0 border-b border-solid border-[#ddd]" />
						</div>
					)}
				</div>

				{/* `.card-footer` — porto's `.card-footer { margin-top: -5px }` is never reset */}
				<footer className="-mt-[5px] flex min-h-[68px] shrink-0 items-center justify-end rounded-b-[20px] border-0 bg-[var(--bg-tertiary)] px-[30px]">
					<div className="text-right">
						{/* `.tbr_custom_modal .card-footer .tbr_btn-light { background-color: var(--bg-inverse) }` */}
						<LegacyButton variant="light" className="mr-[8px] bg-[var(--bg-inverse)]" onClick={onClose}>
							Batal
						</LegacyButton>{" "}
						<LegacyButton variant="primary" onClick={() => onSave(draft)}>
							Simpan
						</LegacyButton>
					</div>
				</footer>
			</section>
		</LegacyModalOverlay>
	)
}

export default CapabilityAmountModal
