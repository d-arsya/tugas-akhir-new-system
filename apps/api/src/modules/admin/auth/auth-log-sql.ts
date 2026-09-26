import { TIMEZONE, type SqlParams } from "@admin/common/sql"
import type { AUTH_LOG_SORT_KEYS, AuthLogQuery } from "@admin/auth/dto/auth-log.dto"

// Raw SQL for the Authentication Log page. Legacy `AuthLogController@list` renders every row in
// PHP and lets DataTables search/sort/page in the browser; the port does all three in Postgres,
// so every displayed value has to be built here for the search to see the same text.

const MONTHS_ID = `(ARRAY['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'])`

const local = (column: string): string => `(${column} AT TIME ZONE '${TIMEZONE}')`

// `formatDate($date, 'd F Y \j\a\m H:i:m')` — legacy printed the month where the seconds belong;
// the port shows real seconds (plan decision).
const indoDateTime = (column: string): string => `CASE WHEN ${column} IS NULL THEN NULL ELSE
		to_char(${local(column)}, 'DD') || ' ' || ${MONTHS_ID}[EXTRACT(MONTH FROM ${local(column)})::int]
		|| ' ' || to_char(${local(column)}, 'YYYY') || ' jam ' || to_char(${local(column)}, 'HH24:MI:SS') END`

// `manuallyGetBrowserName()` — `strpos` is case-sensitive and the order of the checks matters
const BROWSER = `CASE
		WHEN al.user_agent LIKE '%MSIE%' THEN 'Microsoft Internet Explorer'
		WHEN al.user_agent LIKE '%Chrome%' THEN 'Google Chrome'
		WHEN al.user_agent LIKE '%Firefox%' THEN 'Mozilla Firefox'
		WHEN al.user_agent LIKE '%Opera%' THEN 'Opera'
		WHEN al.user_agent LIKE '%Safari%' THEN 'Apple Safari'
		ELSE 'Tidak diketahui'
	END`

// `Carbon::parse($log->login_at)->diffForHumans()`: a NULL login_at parses as "now", so a Failed
// row reads "1 detik yang lalu". Carbon keeps the largest unit only and never prints 0.
const AGE = `age(now() AT TIME ZONE '${TIMEZONE}', COALESCE(al.login_at, now()) AT TIME ZONE '${TIMEZONE}')`
const part = (unit: string): string => `EXTRACT(${unit} FROM ${AGE})::int`
const LAST_SEEN = `CASE
		WHEN ${part("YEAR")} > 0 THEN ${part("YEAR")} || ' tahun yang lalu'
		WHEN ${part("MONTH")} > 0 THEN ${part("MONTH")} || ' bulan yang lalu'
		WHEN ${part("DAY")} >= 7 THEN (${part("DAY")} / 7) || ' minggu yang lalu'
		WHEN ${part("DAY")} > 0 THEN ${part("DAY")} || ' hari yang lalu'
		WHEN ${part("HOUR")} > 0 THEN ${part("HOUR")} || ' jam yang lalu'
		WHEN ${part("MINUTE")} > 0 THEN ${part("MINUTE")} || ' menit yang lalu'
		ELSE GREATEST(${part("SECOND")}, 1) || ' detik yang lalu'
	END`

/** The eight values the legacy row array holds after the "No", ready to render. */
const COLUMNS = {
	email: "al.email",
	browser: BROWSER,
	os: "al.os",
	duration: "al.duration",
	lastSeen: LAST_SEEN,
	lastLogin: indoDateTime("al.login_at"),
	lastLogout: indoDateTime("al.logout_at"),
	loginStatus: "al.login_status",
} as const

export const AUTH_LOG_FROM = "FROM tbr_auth_logs al"

export const AUTH_LOG_SELECT = `SELECT al.id,
		${COLUMNS.email} AS email,
		${COLUMNS.browser} AS browser,
		${COLUMNS.os} AS os,
		${COLUMNS.duration} AS duration,
		${COLUMNS.lastSeen} AS "lastSeen",
		${COLUMNS.lastLogin} AS "lastLogin",
		${COLUMNS.lastLogout} AS "lastLogout",
		${COLUMNS.loginStatus} AS "loginStatus"`

/**
 * DataTables smart search: the term is split on whitespace and every word has to appear in one of
 * the displayed values, case-insensitively. The "No" column is left out — it only exists once the
 * rows have been ordered and paged.
 */
export const authLogWhere = (search: string | undefined, params: SqlParams): string => {
	const words = (search ?? "").split(/\s+/).filter((word) => word.length > 0)
	if (words.length === 0) return ""
	const columns = Object.values(COLUMNS)
	const clauses = words.map((word) => {
		const term = params.add(`%${word}%`)
		return `(${columns.map((column) => `COALESCE(${column}, '') ILIKE ${term}`).join(" OR ")})`
	})
	return `WHERE ${clauses.join(" AND ")}`
}

// Date columns order by their timestamp instead of the rendered text (plan decision)
const SORT_EXPRESSIONS: Record<(typeof AUTH_LOG_SORT_KEYS)[number], string> = {
	// `latest()` = created_at DESC, which is the order the "No" column counts in
	no: "al.created_at DESC, al.id DESC",
	email: "al.email",
	browser: BROWSER,
	os: "al.os",
	duration: "al.duration",
	lastSeen: "COALESCE(al.login_at, now())",
	lastLogin: "al.login_at",
	lastLogout: "al.logout_at",
	loginStatus: "al.login_status",
}

export const authLogOrderBy = (query: AuthLogQuery): string => {
	const key = query.sortBy ?? "no"
	const descending = query.sortDir === "desc"
	// Reversing the "No" column means reversing the underlying order
	if (key === "no") return descending ? "ORDER BY al.created_at ASC, al.id ASC" : `ORDER BY ${SORT_EXPRESSIONS.no}`
	// DataTables sorts a missing value as "", so empty cells lead in asc and trail in desc
	const direction = descending ? "DESC NULLS LAST" : "ASC NULLS FIRST"
	return `ORDER BY ${SORT_EXPRESSIONS[key]} ${direction}, al.created_at DESC, al.id DESC`
}
