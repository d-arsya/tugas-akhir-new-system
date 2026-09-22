// Date helpers for the bootstrap-datepicker port (`format: "dd/mm/yyyy"`, `language: "id"`)

export const DP_MONTHS = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
]
export const DP_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"]
// Locale `id` keeps weekStart 0 (Sunday)
export const DP_DAYS_MIN = ["Mg", "Sn", "Sl", "Ra", "Ka", "Ju", "Sa"]

// Local midnight
export const dayOf = (year: number, month: number, day: number): Date => new Date(year, month, day)

export const sameDay = (a: Date | null, b: Date | null): boolean =>
	!!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const pad = (n: number): string => String(n).padStart(2, "0")

export const formatDmy = (date: Date | null): string =>
	date ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` : ""

// Accepts d/m/yyyy like bootstrap-datepicker's parser; out-of-range parts roll over as in JS Date
export const parseDmy = (value: string): Date | null => {
	const match = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(value)
	return match ? dayOf(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : null
}

// Six weeks starting on the Sunday on or before the 1st, like the legacy days view
export const monthGrid = (year: number, month: number): Date[] => {
	const first = dayOf(year, month, 1)
	const start = dayOf(year, month, 1 - first.getDay())
	return Array.from({ length: 42 }, (_, i) => dayOf(start.getFullYear(), start.getMonth(), start.getDate() + i))
}
