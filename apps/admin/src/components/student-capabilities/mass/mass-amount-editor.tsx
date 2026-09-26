import type { JSX } from "react"

import type { CapabilityItemRow } from "@roja/types"

import CapabilityAmountModal from "@/components/student-capabilities/modals/capability-amount-modal"

import type { MassDraft } from "./use-mass-draft"

const MassAmountEditor = ({ draft }: { draft: MassDraft }): JSX.Element | null => {
	const row: CapabilityItemRow | null = draft.editing
	if (row === null) return null
	return (
		<CapabilityAmountModal
			open
			name={row.name}
			periodLabel={row.periodLabel}
			type={row.type}
			max={row.maxAmount}
			step={row.step}
			value={draft.amounts.get(row.costTermId) ?? row.amount}
			options={row.options}
			onClose={draft.closeEditor}
			onSave={draft.saveAmount}
		/>
	)
}

export default MassAmountEditor
