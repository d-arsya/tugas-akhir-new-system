import { useEffect, useRef, useState } from "react"

import type { ReportArrearFilterParams } from "@roja/types"

import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { toFilterParams, useReportFilters, type ReportFilters } from "./use-report-filters"

type ReportPanel = {
	filters: ReturnType<typeof useReportFilters>
	table: TableState
	setTable: (table: TableState) => void
	reload: number
	filter: () => void
	params: ReportArrearFilterParams
}

export const useReportPanel = (
	initial: ReportFilters,
	resetSignal: number,
	resetTo: (draft: ReportFilters) => ReportFilters,
): ReportPanel => {
	const filters = useReportFilters(initial)
	const [table, setTable] = useState(INITIAL_TABLE_STATE)
	const [reload, setReload] = useState(0)

	const latestForReset = useRef({ filters, resetTo })
	latestForReset.current = { filters, resetTo }

	useEffect(() => {
		if (resetSignal === 0) return
		const { filters: current, resetTo: target } = latestForReset.current
		current.reset(target(current.draft))
		setTable((state) => ({ ...state, search: "", page: 1 }))
		setReload((count) => count + 1)
	}, [resetSignal])

	return {
		filters,
		table,
		setTable,
		reload,
		filter: () => {
			if (!filters.apply()) return
			setTable((state) => ({ ...state, page: 1 }))
			setReload((count) => count + 1)
		},
		params: { ...toFilterParams(filters.applied), search: table.search || undefined },
	}
}
