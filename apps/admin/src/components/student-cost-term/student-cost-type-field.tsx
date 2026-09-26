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

const StudentCostTypeField = ({
	mode,
	type,
	amount,
	amounts,
	onTypeChange,
	onAmountChange,
	onAmountsChange,
}: StudentCostTypeFieldProps): JSX.Element => {
	const bold = mode === "create"
	return (
		<LegacyFormRow label="Tipe Biaya" hint="required" htmlFor="type" labelCols={3} fieldCols={8}>
			<p className="mt-0 mb-[4px] leading-[24px] text-[var(--grey)]">Silakan pilih berbasis maksimum atau pilihan</p>
			<div className="mt-[4px]">
				<LegacyRadioGroup
					name="type"
					value={type}
					options={TYPE_OPTIONS}
					inline
					itemClassName="mt-0 first:mr-[24px]"
					onChange={(value) => onTypeChange(value === "option" ? "option" : "maximum")}
				/>
			</div>

			<div className="mt-[16px] flex">
				<CostCard className="mr-[8px] w-full">
					{type === "maximum" ? (
						<div>
							<HelpLabel bold={bold} htmlFor="amount">
								Tentukan nilai maksimumnya
							</HelpLabel>
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
						<LegacyAmountList values={amounts} onChange={onAmountsChange} />
					)}
				</CostCard>
				<CostTooltip content={type === "maximum" ? MAX_TOOLTIP : OPT_TOOLTIP} />
			</div>
		</LegacyFormRow>
	)
}

export default StudentCostTypeField
