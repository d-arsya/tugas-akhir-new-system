import type { AdminRegistrantListTab, AdminRegistrantRow } from "@roja/types"

// `public/assets/js/registrant/filter.js`: the Jenjang / Jalur selects are DataTables column searches
// (`column(n).search(value, true, false)` — a case-insensitive regex over the cell text) and the date
// range is an `afnFiltering` hook over the "Tanggal Daftar" cell (plus "Diubah Pada" on the rejected tab).

export type RegistrantFilters = {
	/** `strtolower($level->name)`, "" = Semua Jenjang */
	level: string
	/** "reguler" | "indent", "" = Semua Jalur */
	path: string
	/** `dd/mm/yyyy`, "" when empty */
	from: string
	to: string
}

export const EMPTY_FILTERS: RegistrantFilters = { level: "", path: "", from: "", to: "" }

/** The date cell's filter text: the hidden unix timestamp, then the printed `d-m-Y, H:i`. */
export const dateCellText = (ts: number | null, text: string | null): string => (ts === null ? (text ?? "") : `${ts} ${text ?? ""}`)

const matches = (pattern: string, text: string): boolean => {
	if (pattern === "") return true
	try {
		return new RegExp(pattern, "i").test(text)
	} catch {
		return text.toLowerCase().includes(pattern.toLowerCase())
	}
}

/** luxon `DateTime.fromFormat(text, "dd-MM-yyyy, hh:mm").toMillis()` in the browser's zone; NaN when unparseable. */
const cellMillis = (text: string | null): number => {
	const match = /^(\d{2})-(\d{2})-(\d{4}), (\d{2}):(\d{2})$/.exec(text ?? "")
	if (!match) return Number.NaN
	return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4]), Number(match[5])).getTime()
}

/** `DateTime.fromFormat(value, "dd/MM/yyyy").startOf("day")` / `.endOf("day")` */
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
		// Kept as legacy: the rejected tab's Jalur select searches column 5, which is "Tanggal Daftar"
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
		// `if (!aData._date) return false` — a row whose date does not parse never shows
		return !Number.isNaN(date) && date !== 0
	})
}
