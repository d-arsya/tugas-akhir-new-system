import type { JSX } from "react"

import LegacyAmountList from "@/components/legacy/legacy-amount-list"
import LegacyCurrencyInput from "@/components/legacy/legacy-currency-input"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import { Col, CostCard, CostTooltip, HelpLabel, Row } from "@/components/student-cost-term/student-cost-chrome"

type StudentCostTypeFieldProps = {
	mode: "create" | "edit"
	type: "maximum" | "option"
	amount: string
	amounts: string[]
	onTypeChange: (type: "maximum" | "option") => void
	onAmountChange: (amount: string) => void
	onAmountsChange: (amounts: string[]) => void
}

const TYPE_OPTIONS = [
	{ value: "maximum", label: "Maximum", id: "maximum" },
	{ value: "option", label: "Option (Pilihan)", id: "option" },
]

const MAX_TOOLTIP =
	"Anda hanya diperbolehkan menentukan nilai kesanggupan setiap santri tidak lebih dari nilai maximum"
const OPT_TOOLTIP =
	"Anda hanya diperbolehkan memilih salah satu sesuai dengan kesanggupan santri saat membuat kesepakatan"

/**
 * `.input-group.tbr_fix_ig` — the `Rp` prepend legacy pins to 42px (form.css 219), reading
 * `#777777` rather than the append's `--grey`.
 */
const AmountGroup = ({ value, onChange }: { value: string; onChange: (masked: string) => void }): JSX.Element => (
	<div className="relative flex w-full flex-wrap items-stretch">
		<span className="mr-[-2px] flex w-[42px] shrink-0 items-center justify-center rounded-l-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[12px] py-[4px] text-[#777777]">
			Rp
		</span>
		<LegacyCurrencyInput
			id="amount"
			name="amount"
			value={value}
			onChange={onChange}
			className="relative w-[1%] min-w-0 flex-auto rounded-l-none focus:z-[3]"
		/>
	</div>
)

/**
 * Field 1 — `Tipe Biaya`. `showOptionData()` (assets/js/student-cost/general.js) flips
 * `#optionmaximum`/`#optionpilihan` **and** the two tooltips together, straight off the radios.
 *
 * Both blocks stay mounted in legacy, so the hidden branch's inputs are still serialised; the
 * port sends only the selected branch, which is what `required_if` was reaching for anyway.
 */
const StudentCostTypeField = ({
	mode,
	type,
	amount,
	amounts,
	onTypeChange,
	onAmountChange,
	onAmountsChange,
}: StudentCostTypeFieldProps): JSX.Element => {
	// The create blade bolds every `help-block`; the edit blade does not
	const bold = mode === "create"
	return (
		<LegacyFormRow label="Tipe Biaya" hint="required" htmlFor="type" labelCols={3} fieldCols={8}>
			{/* `p.tbr_text-grey.mb-1` */}
			<p className="mt-0 mb-[4px] leading-[24px] text-[var(--grey)]">Silakan pilih berbasis maksimum atau pilihan</p>
			{/* `div.mt-1` = 4px on the wrapper; the items are bare `.custom-control-inline`, so
			    their top margin is 0 and only the first carries `.mr-4`. */}
			<div className="mt-[4px]">
				<LegacyRadioGroup
					name="type"
					value={type}
					options={TYPE_OPTIONS}
					inline
					// `.custom-control-inline.mr-4` on the first radio: 24px, not the kit default 16px
					itemClassName="mt-0 first:mr-[24px]"
					onChange={(value) => onTypeChange(value === "option" ? "option" : "maximum")}
				/>
			</div>

			{/* `.d-flex.mt-3` — the card and the tooltip disc sit side by side */}
			<div className="mt-[16px] flex">
				<CostCard className="mr-[8px] w-full">
					{type === "maximum" ? (
						<div>
							<HelpLabel bold={bold} htmlFor="amount">
								Tentukan nilai maksimumnya
							</HelpLabel>
							{/* create wraps this in `.row > .col-md-8`; edit writes `.input-group.tbr_fix_ig.w-75`
							    straight into the card body, with no gutter */}
							{bold ? (
								<Row>
									<Col className="min-[768px]:max-w-[66.666667%] min-[768px]:flex-[0_0_66.666667%]">
										<AmountGroup value={amount} onChange={onAmountChange} />
									</Col>
								</Row>
							) : (
								<div className="w-3/4">
									<AmountGroup value={amount} onChange={onAmountChange} />
								</div>
							)}
						</div>
					) : (
						// `create-option.js` — max 20 rows, the first row's ✕ permanently `tbr_disabled`
						<LegacyAmountList values={amounts} onChange={onAmountsChange} />
					)}
				</CostCard>
				<CostTooltip content={type === "maximum" ? MAX_TOOLTIP : OPT_TOOLTIP} />
			</div>
		</LegacyFormRow>
	)
}

export default StudentCostTypeField
