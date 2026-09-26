// Raw SQL behind the PSB pages (legacy `RegistrantController`). `tbr_registrants` has no soft deletes
// and no foreign keys; every id / count comes back from node-postgres as a string.

// `config/app.php` → `'timezone' => 'Asia/Jakarta'`; the lists print `d-m-Y, H:i` in it
const TZ = "'Asia/Jakarta'"
const DMY_HI = (column: string): string => `to_char(${column} AT TIME ZONE ${TZ}, 'DD-MM-YYYY, HH24:MI')`
const EPOCH = (column: string): string => `extract(epoch FROM ${column})::bigint`

/** `AcademicYear::with('registrants')->get()` reduced to the five counters of `academicYearList`. */
export const YEAR_LIST_SQL = `
	SELECT ay.id, ay.year, ay.status,
		count(r.id) AS total,
		count(r.id) FILTER (WHERE r.registration_path = 'reguler') AS reguler,
		count(r.id) FILTER (WHERE r.registration_path = 'indent') AS indent,
		count(r.id) FILTER (WHERE r.approval_status = 'approve') AS approve,
		count(r.id) FILTER (WHERE r.approval_status = 'reject') AS reject
	FROM tbr_academic_years ay
	LEFT JOIN tbr_registrants r ON r.academic_year_id = ay.id
	GROUP BY ay.id
	ORDER BY ay.id`

export type YearListRow = {
	id: string
	year: string | null
	status: boolean | null
	total: string
	reguler: string
	indent: string
	approve: string
	reject: string
}

/** `showAcademicYear`: the header count and the three tab badges. */
export const YEAR_PAGE_SQL = `
	SELECT ay.id, ay.year,
		(SELECT count(*) FROM tbr_registrants r WHERE r.academic_year_id = ay.id) AS total,
		(SELECT count(*) FROM tbr_registrants r WHERE r.academic_year_id = ay.id
			AND (r.approval_status IS NULL OR r.approval_status IN ('wait', 'reserve'))) AS new_count,
		(SELECT count(*) FROM tbr_registrants r WHERE r.academic_year_id = ay.id AND r.approval_status = 'approve') AS approve_count,
		(SELECT count(*) FROM tbr_registrants r WHERE r.academic_year_id = ay.id AND r.approval_status = 'reject') AS reject_count
	FROM tbr_academic_years ay
	WHERE ay.id = $1`

export type YearPageRow = {
	id: string
	year: string | null
	total: string
	new_count: string
	approve_count: string
	reject_count: string
}

/** `Level::where('status', 'show')->get()` */
export const SHOWN_LEVELS_SQL = `SELECT id, name FROM tbr_levels WHERE status = 'show' ORDER BY id`

/** `Level::latest()->get()` — the edit widget's select */
export const LATEST_LEVELS_SQL = `SELECT id, name FROM tbr_levels ORDER BY created_at DESC NULLS LAST, id DESC`

const LIST_COLUMNS = `
	r.id, r.registrant_id, r.fullname, r.nis, r.school_name, l.name AS level_name,
	${DMY_HI("r.created_at")} AS created_at, ${EPOCH("r.created_at")} AS created_ts,
	${DMY_HI("r.updated_at")} AS updated_at, ${EPOCH("r.updated_at")} AS updated_ts,
	r.registration_path, r.data_validation, r.indent_test, r.regular_test, r.approval_status`

/**
 * The three lists. "Baru" is `load(['registrants' => whereNull(...)->orWhere(wait)->orWhere(reserve)->latest()])`:
 * the ungrouped ORs leak other years into the eager query, but the relation match keeps only this
 * year's rows, so the result is this year's null / wait / reserve rows, newest first.
 */
export const LIST_SQL: Record<"new" | "approved" | "rejected", string> = {
	new: `SELECT ${LIST_COLUMNS} FROM tbr_registrants r LEFT JOIN tbr_levels l ON l.id = r.level_id
		WHERE r.academic_year_id = $1 AND (r.approval_status IS NULL OR r.approval_status IN ('wait', 'reserve'))
		ORDER BY r.created_at DESC NULLS LAST, r.id DESC`,
	approved: `SELECT ${LIST_COLUMNS} FROM tbr_registrants r LEFT JOIN tbr_levels l ON l.id = r.level_id
		WHERE r.academic_year_id = $1 AND r.approval_status = 'approve' ORDER BY r.id`,
	rejected: `SELECT ${LIST_COLUMNS} FROM tbr_registrants r LEFT JOIN tbr_levels l ON l.id = r.level_id
		WHERE r.academic_year_id = $1 AND r.approval_status = 'reject' ORDER BY r.id`,
}

export type ListRow = {
	id: string
	registrant_id: string | null
	fullname: string | null
	nis: string | null
	school_name: string | null
	level_name: string | null
	created_at: string | null
	created_ts: string | null
	updated_at: string | null
	updated_ts: string | null
	registration_path: string | null
	data_validation: string | null
	indent_test: string | null
	regular_test: string | null
	approval_status: string | null
}

/**
 * `RegistrantExport::getRegistrants()`: all, "wait" (null or wait — reserve is left out, unlike the
 * Baru tab), or one exact status; `$academic_year->registrants` has no ORDER BY, so id order.
 */
export const exportSql = (status: "" | "wait" | "approve" | "reject"): string => {
	const where =
		status === "" ? "" : status === "wait" ? "AND (r.approval_status IS NULL OR r.approval_status = 'wait')" : "AND r.approval_status = $2"
	return `SELECT ${LIST_COLUMNS} FROM tbr_registrants r LEFT JOIN tbr_levels l ON l.id = r.level_id
		WHERE r.academic_year_id = $1 ${where} ORDER BY r.id`
}

/** The edit page: the registrant, its year, and the pieces of `created_at` for the Indonesian label. */
export const DETAIL_SQL = `
	SELECT r.id, r.registrant_id, r.fullname, r.academic_year_id, ay.year, r.level_id, r.registration_path,
		r.email, r.is_blocked, r.registered_by_admin, r.attach_photo, r.data_validation, r.data_validation_note,
		r.indent_test, r.regular_test, r.approval_status,
		to_char(r.created_at AT TIME ZONE ${TZ}, 'DD') AS created_day,
		to_char(r.created_at AT TIME ZONE ${TZ}, 'MM') AS created_month,
		to_char(r.created_at AT TIME ZONE ${TZ}, 'YYYY') AS created_year,
		to_char(r.created_at AT TIME ZONE ${TZ}, 'HH24:MI') AS created_time
	FROM tbr_registrants r
	LEFT JOIN tbr_academic_years ay ON ay.id = r.academic_year_id
	WHERE r.id = $1`

export type DetailRow = {
	id: string
	registrant_id: string | null
	fullname: string | null
	academic_year_id: string | null
	year: string | null
	level_id: string | null
	registration_path: string | null
	email: string | null
	is_blocked: boolean | null
	registered_by_admin: boolean | null
	attach_photo: string | null
	data_validation: string | null
	data_validation_note: string | null
	indent_test: string | null
	regular_test: string | null
	approval_status: string | null
	created_day: string | null
	created_month: string | null
	created_year: string | null
	created_time: string | null
}
