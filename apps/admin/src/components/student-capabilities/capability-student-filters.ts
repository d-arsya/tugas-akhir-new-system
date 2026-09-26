import type { CapabilityStudentRow } from "@roja/types"

export type NumberedStudent = CapabilityStudentRow & { no: number }

export type CapabilityFilter = "" | "Sudah memiliki kesanggupan" | "Belum memiliki kesanggupan"

export const CAPABILITY_FILTER_OPTIONS: { value: CapabilityFilter; label: string }[] = [
	{ value: "", label: "Filter kesanggupan (semua)" },
	{ value: "Sudah memiliki kesanggupan", label: "Sudah memiliki kesanggupan" },
	{ value: "Belum memiliki kesanggupan", label: "Belum memiliki kesanggupan" },
]

const capabilityCellText = (row: CapabilityStudentRow): string =>
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

export const selectionAction = (filter: CapabilityFilter): "create" | "update" =>
	filter === "Sudah memiliki kesanggupan" ? "update" : "create"
