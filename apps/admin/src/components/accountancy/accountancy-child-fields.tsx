import { useMemo, type JSX } from "react"

import type { AccountancyGroup, AccountancyOption } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacySelect from "@/components/legacy/legacy-select"

import AccountancyFieldLabel from "./accountancy-field-label"

type AccountancyChildFieldsProps = {
	options: AccountancyOption[]
	parentId: string
	onParentIdChange: (value: string) => void
	placeholder?: boolean
	group: AccountancyGroup | ""
	onGroupChange: (value: AccountancyGroup) => void
	isStudentCost: boolean
	onIsStudentCostChange: (value: boolean) => void
	idSuffix?: string
	tightLabels?: boolean
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
					<label className="mb-[16px] block leading-[20px]">
						<span className="flex flex-wrap items-center">Pengelompokan</span>
					</label>
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
