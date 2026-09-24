import type { CapabilityStudentRow } from "@roja/types"

// The level-3 filters (`capability-filter.js`) as pure functions over the contract rows.
//
// Legacy filters by string-matching the cell HTML: `column(6).search("Sudah memiliki
// kesanggupan")` against the hidden `<span class='d-none'>` that
// `StudentGrade::getStudentCapabilityCountAttribute()` prefixes to the count, and
// `column(5).search(subgrade, regex=true, smart=false)` against the sub-grade cell. The contract
// carries `hasCapability` instead of the span, so the capability filter is a boolean test here.

export type NumberedStudent = CapabilityStudentRow & { no: number }

/** The three `#capability_filter` options, value = legacy's option value. */
export type CapabilityFilter = "" | "Sudah memiliki kesanggupan" | "Belum memiliki kesanggupan"

export const CAPABILITY_FILTER_OPTIONS: { value: CapabilityFilter; label: string }[] = [
	{ value: "", label: "Filter kesanggupan (semua)" },
	{ value: "Sudah memiliki kesanggupan", label: "Sudah memiliki kesanggupan" },
	{ value: "Belum memiliki kesanggupan", label: "Belum memiliki kesanggupan" },
]

/**
 * The "Kesanggupan" cell as DataTables sees it: the hidden span's text is still part of the cell
 * text, so the global search box matches "Belum" and sorting groups "Belum…" before "Sudah…".
 */
export const capabilityCellText = (row: CapabilityStudentRow): string =>
	`${row.hasCapability ? "Sudah" : "Belum"} memiliki kesanggupan ${row.capabilityCount} Kesanggupan`

export const studentCellText = (row: NumberedStudent, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "nis":
			return row.nis ?? ""
		case "fullName":
			return row.fullName ?? ""
		case "parentOrGuardian":
			return row.parentOrGuardian ?? ""
		case "subGrade":
			return row.subGrade ?? ""
		case "capabilityCount":
			return capabilityCellText(row)
		default:
			return ""
	}
}

export const STUDENT_SEARCH_KEYS = ["no", "nis", "fullName", "parentOrGuardian", "subGrade", "capabilityCount"]

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * The two column filters, applied before the global search exactly as DataTables layers them.
 * The sub-grade filter is a case-insensitive regex *containment* test, not an equality test —
 * `search(value, true, false)` — so it is reproduced as one.
 */
export const applyColumnFilters = (
	rows: NumberedStudent[],
	capability: CapabilityFilter,
	subGrade: string,
): NumberedStudent[] => {
	const subGradePattern = subGrade === "" ? null : new RegExp(escapeRegex(subGrade), "i")
	return rows.filter((row) => {
		if (capability === "Sudah memiliki kesanggupan" && !row.hasCapability) return false
		if (capability === "Belum memiliki kesanggupan" && row.hasCapability) return false
		if (subGradePattern !== null && !subGradePattern.test(row.subGrade ?? "")) return false
		return true
	})
}

/**
 * `save-data-to-session.js:24` — the action comes from the filter, not from the data: "update"
 * only when the filter reads "Sudah memiliki kesanggupan", "create" otherwise. The server then
 * rejects a "create" that includes anyone who already has a capability.
 */
export const selectionAction = (filter: CapabilityFilter): "create" | "update" =>
	filter === "Sudah memiliki kesanggupan" ? "update" : "create"
