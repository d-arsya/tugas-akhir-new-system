import type { AdminRegistrantListTab, AdminRegistrantRow } from "@roja/types"

export type RegistrantFilters = {
	level: string
	path: string
	from: string
	to: string
}

export const EMPTY_FILTERS: RegistrantFilters = { level: "", path: "", from: "", to: "" }

export const dateCellText = (ts: number | null, text: string | null): string => (ts === null ? (text ?? "") : `${ts} ${text ?? ""}`)

const matches = (pattern: string, text: string): boolean => {
	if (pattern === "") return true
	try {
		return new RegExp(pattern, "i").test(text)
	} catch {
		return text.toLowerCase().includes(pattern.toLowerCase())
	}
}

const cellMillis = (text: string | null): number => {
	const match = /^(\d{2})-(\d{2})-(\d{4}), (\d{2}):(\d{2})$/.exec(text ?? "")
	if (!match) return Number.NaN
	return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4]), Number(match[5])).getTime()
}

const boundMillis = (value: string, end: boolean): number => {
	const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim())
	if (!match) return Number.NaN
	const day = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
	return end ? day.getTime() + 24 * 60 * 60 * 1000 - 1 : day.getTime()
}

export const applyRegistrantFilters = (rows: AdminRegistrantRow[], tab: AdminRegistrantListTab, filters: RegistrantFilters): AdminRegistrantRow[] => {
	const min = boundMillis(filters.from, false)
	const max = boundMillis(filters.to, true)
	return rows.filter((row) => {
		if (!matches(filters.level, row.levelName ?? "")) return false
		// Deliberate: on the rejected tab the Jalur filter matches the "Tanggal Daftar" cell
		const pathCell = tab === "rejected" ? dateCellText(row.createdTs, row.createdAt) : row.registrationPath
		if (!matches(filters.path, pathCell)) return false

		const date = cellMillis(row.createdAt)
		if (tab === "rejected") {
			const changed = cellMillis(row.updatedAt)
			if (!Number.isNaN(min) && min && date < min && changed < min) return false
			if (!Number.isNaN(max) && max && date > max && changed > max) return false
		} else {
			if (!Number.isNaN(min) && min && date < min) return false
			if (!Number.isNaN(max) && max && date > max) return false
		}
		return !Number.isNaN(date) && date !== 0
	})
}
