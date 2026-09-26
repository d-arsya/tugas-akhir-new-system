import { useState } from "react"

import type { ReportArrearFilterParams } from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { todayDmy } from "@/lib/legacy-format"

export type ReportFilters = {
	from: string
	to: string
	academicYear: string
	grade: string
	subGrade: string
	accountancy: string
}

export const emptyFilters = (from = "", to = ""): ReportFilters => ({
	from,
	to,
	academicYear: "",
	grade: "",
	subGrade: "",
	accountancy: "",
})

export const todayFilters = (): ReportFilters => emptyFilters(todayDmy(), todayDmy())

const validateReportFilters = (filters: ReportFilters): boolean => {
	if (filters.subGrade && !filters.academicYear && !filters.grade) {
		legacyNotify.error(["Tahun ajaran wajib untuk dipilih.", "Kelas wajib untuk dipilih."])
		return false
	}
	if (filters.grade && !filters.academicYear) {
		legacyNotify.error("Tahun ajaran wajib untuk dipilih.")
		return false
	}
	return true
}

export const toFilterParams = (filters: ReportFilters): ReportArrearFilterParams => ({
	from: filters.from || undefined,
	to: filters.to || undefined,
	academicYear: filters.academicYear || undefined,
	grade: filters.grade || undefined,
	subGrade: filters.subGrade || undefined,
	accountancy: filters.accountancy || undefined,
})

export const useReportFilters = (
	initial: ReportFilters,
): {
	draft: ReportFilters
	applied: ReportFilters
	setDraft: (patch: Partial<ReportFilters>) => void
	apply: () => boolean
	reset: (next: ReportFilters) => void
} => {
	const [draft, setDraftState] = useState(initial)
	const [applied, setApplied] = useState(initial)

	return {
		draft,
		applied,
		setDraft: (patch) => setDraftState((current) => ({ ...current, ...patch })),
		apply: () => {
			if (!validateReportFilters(draft)) return false
			setApplied(draft)
			return true
		},
		reset: (next) => {
			setDraftState(next)
			setApplied(next)
		},
	}
}
