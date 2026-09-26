/** `config('app.locale') = 'id'`, as Carbon's `translatedFormat` renders month names. */
export const MONTHS_ID = [
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
] as const

/**
 * Carbon's `months_short` for `id` (vendor/nesbot/carbon/src/Carbon/Lang/id.php:85).
 * **Not** the first three letters of the long names: August is "Agt", not "Agu".
 */
export const MONTHS_SHORT_ID = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"Mei",
	"Jun",
	"Jul",
	"Agt",
	"Sep",
	"Okt",
	"Nov",
	"Des",
] as const

/**
 * Legacy `formatDate($date, 'd F Y \j\a\m H.i')` → "23 September 2026 jam 14.05".
 *
 * Note the **dot** between hours and minutes, and that there are no seconds. The
 * Lainnya pages use `H:i` with a colon — the two modules really do differ, so do
 * not "unify" them.
 *
 * `local` is an already-Jakarta-local `YYYY-MM-DDTHH:MM:SS` string, produced by
 * `LOCAL_TIMESTAMP` below, so no timezone maths happens in JavaScript.
 */
export const indoDateTimeDot = (local: string | null): string => {
	if (!local) return ""
	const month = MONTHS_ID[Number(local.slice(5, 7)) - 1] ?? ""
	return `${local.slice(8, 10)} ${month} ${local.slice(0, 4)} jam ${local.slice(11, 13)}.${local.slice(14, 16)}`
}

/** Legacy `formatDate($date, 'd F Y')` → "23 September 2026". */
export const indoDate = (local: string | null): string => {
	if (!local) return ""
	const month = MONTHS_ID[Number(local.slice(5, 7)) - 1] ?? ""
	return `${local.slice(8, 10)} ${month} ${local.slice(0, 4)}`
}

/** Legacy `formatFromTo($date, 'Y-m-d', 'd M Y')` → "01 Jul 2026" (short month, used by cost periods). */
export const indoDateShort = (isoDate: string | null): string => {
	if (!isoDate) return ""
	const month = MONTHS_SHORT_ID[Number(isoDate.slice(5, 7)) - 1] ?? ""
	return `${isoDate.slice(8, 10)} ${month} ${isoDate.slice(0, 4)}`
}

/** `d/m/Y` as the academic-year cost-date accessors render it. */
export const toDmySlash = (isoDate: string | null): string | null => {
	if (!isoDate) return null
	return `${isoDate.slice(8, 10)}/${isoDate.slice(5, 7)}/${isoDate.slice(0, 4)}`
}

/** `d-m-Y` as the `active_kbm` accessor renders it — a different separator from the cost dates. */
export const toDmyDash = (isoDate: string | null): string | null => {
	if (!isoDate) return null
	return `${isoDate.slice(8, 10)}-${isoDate.slice(5, 7)}-${isoDate.slice(0, 4)}`
}

/** Parses `d/m/Y` or `d-m-Y` into `Y-m-d`; returns null when the shape does not match. */
export const fromDmy = (value: string | null | undefined): string | null => {
	if (!value) return null
	const match = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(value)
	if (!match) return null
	return `${match[3]}-${match[2]}-${match[1]}`
}

export const parseDmy = (value: string | undefined): string | undefined => {
	const match = value ? /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value) : null
	if (!match) return undefined
	const date = new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])))
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
}
