import { useMemo, type JSX } from "react"

import type { AccountancyGroup, AccountancyOption } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacySelect from "@/components/legacy/legacy-select"

import AccountancyFieldLabel from "./accountancy-field-label"

/**
 * `#childData` — the nested card the Akun form reveals for an "Anak akun", shared verbatim by
 * `accountancy/index.blade.php` and `accountancy/edit.blade.php`.
 *
 * `assets/css/accountancy/custom.css` is the whole stylesheet for this page and exists only for
 * this block:
 *   #childData { margin-left: -15px; margin-right: -15px; }
 *   #childData > .card > .card-body { box-shadow: none; }
 * The inner `is_student_cost` card is a grandchild, so it keeps its shadow.
 */
type AccountancyChildFieldsProps = {
	/** `Pilih induk akun` — `Accountancy::all()`, so any account can be a parent. */
	options: AccountancyOption[]
	/** "" while nothing is chosen; the create form starts there, the edit modal never does. */
	parentId: string
	onParentIdChange: (value: string) => void
	/** The create form has a blank first option, the edit modal has none. */
	placeholder?: boolean
	group: AccountancyGroup | ""
	onGroupChange: (value: AccountancyGroup) => void
	isStudentCost: boolean
	onIsStudentCostChange: (value: boolean) => void
	/** Suffix for the input ids — the edit modal renders a second copy of this block. */
	idSuffix?: string
	/** The edit blade's labels carry `m-0`; the create blade's keep bootstrap's 8px. */
	tightLabels?: boolean
	/** `.card-body.p-3` on the create form, `.p-2` in the edit modal. */
	innerPadding?: string
}

const PLACEHOLDER = { value: "", label: "Select" }

const AccountancyChildFields = ({
	options,
	parentId,
	onParentIdChange,
	placeholder = false,
	group,
	onGroupChange,
	isStudentCost,
	onIsStudentCostChange,
	idSuffix = "",
	tightLabels = false,
	innerPadding = "p-[16px]",
}: AccountancyChildFieldsProps): JSX.Element => {
	const selectOptions = useMemo(() => {
		const rows = options.map((option) => ({ value: String(option.id), label: option.name ?? "" }))
		return placeholder ? [PLACEHOLDER, ...rows] : rows
	}, [options, placeholder])

	const groupOptions = [
		{ value: "income", label: "Pemasukan", id: `income${idSuffix}` },
		{ value: "expense", label: "Pengeluaran", id: `expense${idSuffix}` },
	]

	return (
		// `div#childData.justify-content-center.mb-4` — `justify-content-center` is inert, the div is not a flex container
		<div className="mx-[-15px] mb-[24px]">
			<LegacyCard bodyClassName="p-[16px] shadow-none">
				<div className="mb-[16px]">
					<AccountancyFieldLabel htmlFor={`parent_id${idSuffix}`} badge="required" tight={tightLabels}>
						Pilih induk akun
					</AccountancyFieldLabel>
					<LegacySelect
						value={parentId}
						options={selectOptions}
						onChange={onParentIdChange}
						mutedText={parentId === ""}
					/>
				</div>

				<div className="mb-[16px]">
					{/* `label.control-label.d-block.mb-3` wrapping a `.d-flex.align-items-center.flex-wrap` */}
					<label className="mb-[16px] block leading-[20px]">
						<span className="flex flex-wrap items-center">Pengelompokan</span>
					</label>
					{/* `.custom-control.custom-radio.mr-2` — an 8px gap, not `.custom-control-inline`'s 16px */}
					<LegacyRadioGroup
						name={`group${idSuffix}`}
						value={group}
						options={groupOptions}
						onChange={(value) => onGroupChange(value as AccountancyGroup)}
						inline
						className="items-center"
						itemClassName="mt-0 mr-[8px] last:mr-0"
					/>
				</div>

				{/* `.card.tbr_card.mb-2 > .card-body` — a grandchild of #childData, so the shadow stays */}
				<LegacyCard className="mb-[8px]" bodyClassName={innerPadding}>
					<LegacyCheckbox
						id={`is_student_cost${idSuffix}`}
						name="is_student_cost"
						checked={isStudentCost}
						onChange={onIsStudentCostChange}
						label="Tetapkan sebagai biaya santri"
					/>
				</LegacyCard>
			</LegacyCard>
		</div>
	)
}

export default AccountancyChildFields
