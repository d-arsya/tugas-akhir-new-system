import { useEffect, useMemo, useState } from "react"

import type { CapabilityItemInput, CapabilityItemRow } from "@roja/types"

export type MassDraft = {
	rows: CapabilityItemRow[]
	checked: Set<number>
	amounts: Map<number, number | null>
	allChecked: boolean
	toggle: (costTermId: number, next: boolean) => void
	toggleAll: (next: boolean) => void
	editing: CapabilityItemRow | null
	openEditor: (row: CapabilityItemRow) => void
	closeEditor: () => void
	saveAmount: (amount: number | null) => void
	saveDisabled: boolean
	payload: CapabilityItemInput[]
	shownAccountancyIds: number[]
}

export const useMassDraft = (rows: CapabilityItemRow[] | undefined, initialDisabled = false): MassDraft => {
	const data = useMemo(() => rows ?? [], [rows])
	const [checked, setChecked] = useState<Set<number>>(new Set())
	const [amounts, setAmounts] = useState<Map<number, number | null>>(new Map())
	const [editing, setEditing] = useState<CapabilityItemRow | null>(null)
	const [touched, setTouched] = useState(false)

	useEffect(() => {
		setChecked(new Set(data.filter((row) => row.selected).map((row) => row.costTermId)))
		setAmounts(new Map(data.map((row) => [row.costTermId, row.amount])))
		setTouched(false)
	}, [data])

	const amountOf = (row: CapabilityItemRow): number | null => amounts.get(row.costTermId) ?? row.amount
	const checkedRows = data.filter((row) => checked.has(row.costTermId))

	const liveDisabled = checkedRows.length === 0 || checkedRows.some((row) => amountOf(row) === null)

	return {
		rows: data,
		checked,
		amounts,
		allChecked: data.length > 0 && checked.size === data.length,
		toggle: (costTermId, next) => {
			setTouched(true)
			setChecked((current) => {
				const updated = new Set(current)
				if (next) updated.add(costTermId)
				else updated.delete(costTermId)
				return updated
			})
		},
		toggleAll: (next) => {
			setTouched(true)
			setChecked(next ? new Set(data.map((row) => row.costTermId)) : new Set())
		},
		editing,
		openEditor: setEditing,
		closeEditor: () => setEditing(null),
		saveAmount: (amount) => {
			setTouched(true)
			if (editing !== null) setAmounts((current) => new Map(current).set(editing.costTermId, amount))
			setEditing(null)
		},
		saveDisabled: touched ? liveDisabled : initialDisabled || liveDisabled,
		payload: checkedRows.map((row) => ({
			accountancyId: row.accountancyId,
			// An unpicked option row posts "", which the server rejects with "Semua kesanggupan wajib untuk dipilih."
			amount: amountOf(row) === null ? "" : String(amountOf(row)),
		})),
		shownAccountancyIds: data.map((row) => row.accountancyId),
	}
}
