import type {
	AdminRegistrantAcademicYearRow,
	AdminRegistrantProgress,
	AdminRegistrantRow,
	AdminRegistrantYearStatus,
} from "@roja/types"

import type { DetailRow, ListRow, YearListRow } from "./registrant-sql"

// Row shaping for the PSB pages — the parts of `RegistrantController` / `RegistrantService` that turn a
// model into a DataTables cell.

const numberOrNull = (value: string | null): number | null => (value === null ? null : Number(value))

/** Laravel `Str::title()`: every word capitalised (`mb_convert_case(MB_CASE_TITLE)`). */
export const strTitle = (value: string | null): string =>
	(value ?? "").toLowerCase().replace(/(^|[^\p{L}\p{N}'])(\p{L})/gu, (_, before: string, letter: string) => `${before}${letter.toUpperCase()}`)

/** `RegistrantService::progressLabel()` */
export const progressOf = (row: Pick<ListRow, "data_validation" | "registration_path" | "indent_test" | "regular_test">): AdminRegistrantProgress => {
	if (row.data_validation !== "valid") return "validation"
	if (row.registration_path === "indent" && row.indent_test === null) return "indent"
	if ((row.registration_path === "reguler" || row.indent_test === "failed") && row.regular_test === null) return "regular"
	return "announcement"
}

export const toRegistrantRow = (row: ListRow): AdminRegistrantRow => ({
	id: Number(row.id),
	registrantId: row.registrant_id,
	fullname: row.fullname,
	nis: row.nis,
	schoolName: row.school_name,
	levelName: row.level_name,
	createdAt: row.created_at,
	createdTs: numberOrNull(row.created_ts),
	registrationPath: strTitle(row.registration_path),
	progress: progressOf(row),
	updatedAt: row.updated_at,
	updatedTs: numberOrNull(row.updated_ts),
})

/** `AcademicYearService::getStatus()` */
const yearStatus = (row: Pick<YearListRow, "id" | "status">): AdminRegistrantYearStatus =>
	Number(row.id) === 1 ? "none" : row.status === true ? "open" : "closed"

/**
 * `academicYearList`: `sortByDesc` on the first run of digits in the year (0 when there is none).
 * PHP's sort is stable, so equal keys keep the query's id order.
 */
export const toYearRows = (rows: YearListRow[]): AdminRegistrantAcademicYearRow[] => {
	const key = (year: string | null): number => Number(/\d+/.exec(year ?? "")?.[0] ?? 0)
	return rows
		.map((row, index) => ({ row, index }))
		.sort((a, b) => key(b.row.year) - key(a.row.year) || a.index - b.index)
		.map(({ row }) => ({
			id: Number(row.id),
			year: row.year,
			total: Number(row.total),
			reguler: Number(row.reguler),
			indent: Number(row.indent),
			approve: Number(row.approve),
			reject: Number(row.reject),
			status: yearStatus(row),
		}))
}

const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

/** `formatDate($created_at, 'd F Y \j\a\m H:i')` with the `id` locale. */
export const createdAtLabel = (row: Pick<DetailRow, "created_day" | "created_month" | "created_year" | "created_time">): string | null =>
	row.created_day === null
		? null
		: `${row.created_day} ${MONTHS_ID[Number(row.created_month) - 1] ?? ""} ${row.created_year ?? ""} jam ${row.created_time ?? ""}`
