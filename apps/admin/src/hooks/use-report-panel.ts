import { useEffect, useRef, useState } from "react"

import type { ReportArrearFilterParams } from "@roja/types"

import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { toFilterParams, useReportFilters, type ReportFilters } from "./use-report-filters"

type ReportPanel = {
	filters: ReturnType<typeof useReportFilters>
	table: TableState
	setTable: (table: TableState) => void
	reload: number
	// Legacy "Filter" button: validate, then reload from the first page
	filter: () => void
	// Applied filters + the search box (what the legacy export link carries)
	params: ReportArrearFilterParams
}

// State of one legacy report table: filter bar, DataTables request and the sticky-toolbar reset.
// `resetSignal` increments when the toolbar reset is clicked; `resetTo` gives the filters to reset to
export const useReportPanel = (
	initial: ReportFilters,
	resetSignal: number,
	resetTo: (draft: ReportFilters) => ReportFilters,
): ReportPanel => {
	const filters = useReportFilters(initial)
	const [table, setTable] = useState(INITIAL_TABLE_STATE)
	const [reload, setReload] = useState(0)

	// Latest values for the reset effect without re-running it on every change
	const latest = useRef({ filters, resetTo })
	latest.current = { filters, resetTo }

	useEffect(() => {
		if (resetSignal === 0) return
		const { filters: current, resetTo: target } = latest.current
		current.reset(target(current.draft))
		// DataTables keeps the ordering but clears the search box and goes back to page 1
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
