// Raw SQL for the Tahun Ajaran list, detail and quota tables.
//
// Legacy `AcademicYearController@list` reads every academic year, sorts them in PHP and then,
// per row, fires two more queries to decide where the destroy icon points. `@editLevelList`
// is worse: it re-`find()`s the academic year and lazy-loads `$level->academicYears` once per
// level. Each of those becomes a single statement here; the comments name the PHP each
// expression replaces.

/**
 * `sortByDesc(fn => preg_match('/\d+/', $item->year, $m) ? (int)$m[0] : 0)`.
 *
 * PHP takes the **first digit run** in `year` — so "2026/2027" keys on 2026 and "Archive",
 * which has no digits, keys on 0 and therefore sorts last. `LEFT(…, 18)` keeps a pathological
 * `year` from overflowing bigint the way PHP's `(int)` cast saturates at PHP_INT_MAX.
 */
const YEAR_SORT_KEY = `COALESCE(LEFT(substring(ay.year from '[0-9]+'), 18)::bigint, 0)`

/**
 * `AcademicYearService::delegateAction()` — the destroy link's target, picked per row at
 * list-render time, in this priority order.
 *
 * `deleted_at IS NULL` on the student_grades probe is load-bearing: `StudentGrade` uses
 * `SoftDeletes`, so the legacy `StudentGrade::where(...)->count()` carries the global scope.
 * 162 of the 1 994 rows are soft-deleted.
 */
const DELETE_TARGET = `CASE
			WHEN EXISTS (SELECT 1 FROM tbr_registrants r WHERE r.academic_year_id = ay.id) THEN 'delegate-registrant'
			WHEN EXISTS (
				SELECT 1 FROM tbr_student_grades sg
				 WHERE sg.current_academic_year = ay.year AND sg.deleted_at IS NULL
			) THEN 'delegate-student'
			WHEN EXISTS (SELECT 1 FROM tbr_alumnis al WHERE al.academic_year_id = ay.id) THEN 'delegate-alumni'
			ELSE 'delete'
		END`

/**
 * `AcademicYearService::getStatusAkademik()`, flattened.
 *
 * Legacy walks three branches on `now()` (app timezone Asia/Jakarta) against the cost period
 * and short-circuits to green "Berjalan" inside every one of them when `is_current` is set,
 * so the only case that renders anything else is a period that has already ended. A period
 * that is running or still in the future — and the boundary-equality and null-date cases,
 * where the function falls off the end and returns `null` — all render an empty cell.
 */
const STATUS_AKADEMIK = `CASE
			WHEN ay.year = 'Archive' THEN 'none'
			WHEN ay.is_current THEN 'berjalan'
			WHEN ay.cost_date_end IS NOT NULL
				AND (now() AT TIME ZONE 'Asia/Jakarta') > ay.cost_date_end::timestamp THEN 'berakhir'
			ELSE 'empty'
		END`

/** `getStatus()` — a null `status` is falsy in PHP, so it reads as "Ditutup". */
const STATUS_PSB = `CASE WHEN ay.year = 'Archive' THEN 'none' WHEN ay.status THEN 'open' ELSE 'closed' END`

/**
 * The whole list in one statement. The decision register keys the magic Archive row on
 * `year = 'Archive'` instead of legacy's `id == 1`; in this database the two coincide.
 *
 * `ay.id ASC` is the tie-break: legacy's `->get()` hands `sortByDesc` the rows in insertion
 * order and PHP's sort is stable, so two years with the same leading digits keep their id order.
 */
export const ACADEMIC_YEAR_LIST_SQL = `SELECT ay.id,
		ay.year,
		to_char(ay.cost_date_start, 'YYYY-MM-DD') AS "costDateStart",
		to_char(ay.cost_date_end, 'YYYY-MM-DD') AS "costDateEnd",
		${STATUS_PSB} AS "statusPsb",
		${STATUS_AKADEMIK} AS "statusAkademik",
		${DELETE_TARGET} AS "deleteTarget",
		(ay.year IS NOT DISTINCT FROM 'Archive') AS "isArchive"
	FROM tbr_academic_years ay
	ORDER BY ${YEAR_SORT_KEY} DESC, ay.id ASC`

/**
 * `AcademicYearController@edit`'s model binding, plus the two year halves the blade derives
 * with `intval(Str::limit($year, 4))` and `intval(Str::substr($year, 5, 8))`.
 * Dates come back as ISO text; `toDmyDash` / `toDmySlash` apply the legacy accessors' formats.
 */
export const ACADEMIC_YEAR_DETAIL_SQL = `SELECT ay.id,
		ay.year,
		to_char(ay.active_kbm, 'YYYY-MM-DD') AS "activeKbm",
		ay.note,
		ay.serial_number AS "serialNumber",
		ay.type,
		COALESCE(ay.status, false) AS status,
		COALESCE(ay.is_current, false) AS "isCurrent",
		to_char(ay.cost_date_start, 'YYYY-MM-DD') AS "costDateStart",
		to_char(ay.cost_date_end, 'YYYY-MM-DD') AS "costDateEnd"
	FROM tbr_academic_years ay
	WHERE ay.id = $1`

/**
 * `Level::where('status','show')->latest()->get()` — the level order both quota tables use.
 * `latest()` is `created_at DESC` alone; `id DESC` is added so ties are deterministic.
 */
export const ACADEMIC_YEAR_LEVELS_SQL = `SELECT l.id AS "levelId", l.name AS "levelName"
	FROM tbr_levels l
	WHERE l.status = 'show'
	ORDER BY l.created_at DESC, l.id DESC`

/**
 * `AcademicYearController@editLevelList`, de-N+1'd.
 *
 * * **Kuota** — `optional(optional($level->academicYears->firstWhere('id', $ay->id))->pivot)->quota ?? 0`.
 * * **PSB** — the constrained eager load `registrants` for this level, counted in PHP after
 *   `->where('approval_status','approve')`.
 * * **TMQ** — `StudentGrade` on this level whose `current_academic_year` is the year *string*,
 *   at the level's **lowest** `grades.label` (defaulting to 1 when the level has no grades —
 *   true for Levels 4, 6 and 8 today), from a promotion, and not soft-deleted.
 *
 * "Sisa" and the "Penuh" badge are deliberately absent: `add-quota.js` recomputes them in the
 * browser as the user edits the quota, so the client owns that rule.
 */
export const ACADEMIC_YEAR_QUOTA_ROWS_SQL = `SELECT l.id AS "levelId",
		l.name AS "levelName",
		COALESCE(pivot.quota, 0)::int AS quota,
		(
			SELECT COUNT(*) FROM tbr_registrants r
			 WHERE r.academic_year_id = ay.id AND r.level_id = l.id AND r.approval_status = 'approve'
		)::int AS psb,
		(
			SELECT COUNT(*) FROM tbr_student_grades sg
			 WHERE sg.level_id = l.id
			   AND sg.current_academic_year = ay.year
			   AND sg.grade = COALESCE(lowest.label, 1)
			   AND sg.grade_note IN ('tinggal kelas', 'kenaikan kelas')
			   AND sg.deleted_at IS NULL
		)::int AS tmq
	FROM tbr_levels l
	CROSS JOIN (SELECT id, year FROM tbr_academic_years WHERE id = $1) ay
	LEFT JOIN LATERAL (
		SELECT MIN(g.label) AS label FROM tbr_grades g WHERE g.level_id = l.id
	) lowest ON TRUE
	LEFT JOIN LATERAL (
		SELECT lay.quota FROM tbr_level_academic_years lay
		 WHERE lay.level_id = l.id AND lay.academic_year_id = ay.id
		 ORDER BY lay.id
		 LIMIT 1
	) pivot ON TRUE
	WHERE l.status = 'show'
	ORDER BY l.created_at DESC, l.id DESC`

/** `AcademicYearExistRule` — `AcademicYear::where('year', $value.'/'.(intval($value)+1))->exists()`. */
export const ACADEMIC_YEAR_EXISTS_SQL = `SELECT 1 FROM tbr_academic_years WHERE year = $1 LIMIT 1`

/**
 * B-11: legacy demotes only the **first** row it finds with `is_current = 1` (`->first()`),
 * leaving any others current. There is no unique constraint, so that state is reachable.
 * The port demotes every other one.
 */
export const DEMOTE_CURRENT_YEARS_SQL = `UPDATE tbr_academic_years
	   SET is_current = false, updated_at = now()
	 WHERE is_current = true AND id <> $1`

/**
 * `AcademicYear::create(...)` followed by the second `update()` that writes the cost dates.
 * Legacy splits them only because the model's accessors would reformat the values on the way
 * in; one INSERT stores exactly the same row.
 */
export const INSERT_ACADEMIC_YEAR_SQL = `INSERT INTO tbr_academic_years
		(year, active_kbm, note, serial_number, type, status, is_current, cost_date_start, cost_date_end, created_at, updated_at)
	VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8::date, $9::date, now(), now())
	RETURNING id`

export const UPDATE_ACADEMIC_YEAR_SQL = `UPDATE tbr_academic_years
	   SET active_kbm = $2::date,
	       note = $3,
	       serial_number = $4,
	       type = $5,
	       status = $6,
	       is_current = $7,
	       cost_date_start = $8::date,
	       cost_date_end = $9::date,
	       updated_at = now()
	 WHERE id = $1`

/**
 * Legacy `attach()` on a `belongsToMany` **without** `->withTimestamps()`, which is why every
 * pivot row in this database has null `created_at` / `updated_at`.
 */
export const INSERT_QUOTA_PIVOT_SQL = `INSERT INTO tbr_level_academic_years (level_id, academic_year_id, quota)
	VALUES ($1, $2, $3)`

/**
 * B-12: legacy `update()` runs `levels()->sync($payload)`, which **detaches** every level
 * missing from it — and the form only renders `status='show'` levels, so saving any year
 * silently deleted the quota rows of hidden levels (live today for Levels 4 and 6 on the
 * Archive year). The port upserts the submitted pivots and leaves the rest alone.
 */
export const FIND_QUOTA_PIVOT_SQL = `SELECT id FROM tbr_level_academic_years
	 WHERE academic_year_id = $1 AND level_id = $2
	 LIMIT 1`

export const UPDATE_QUOTA_PIVOT_SQL = `UPDATE tbr_level_academic_years
	   SET quota = $3
	 WHERE academic_year_id = $1 AND level_id = $2`
