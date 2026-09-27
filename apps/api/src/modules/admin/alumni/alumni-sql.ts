// OWNER: AK-A. Raw SQL for Akademik → Alumni (legacy `AlumniController`). Raw rather than entities: bigints
// come back as strings and `tbr_alumnis` has no entity here. Years are read in the app timezone.

/** `EXTRACT(YEAR FROM graduate_year)` — legacy `list()` / `whereYear('graduate_year', …)`. */
const YEAR = `EXTRACT(YEAR FROM a.graduate_year AT TIME ZONE 'Asia/Jakarta')::int`

/** `whereHas('academicYear', id != 1)`: the year must exist and not be the Archive row. */
const LIVE_YEAR = `ay.id IS NOT NULL AND ay.id <> 1`

/**
 * `list()` (56-105): one row per graduation year over every alumnus, newest first. The three counts only
 * take rows whose academic year exists and is not Archive, so a year of archive rows shows 0.
 */
export const ALUMNI_YEARS_SQL = `SELECT ${YEAR} AS year,
		count(*) FILTER (WHERE ${LIVE_YEAR}) AS total,
		count(*) FILTER (WHERE ${LIVE_YEAR} AND a.gender = 'male') AS male,
		count(*) FILTER (WHERE ${LIVE_YEAR} AND a.gender = 'female') AS female
	FROM tbr_alumnis a
	LEFT JOIN tbr_academic_years ay ON ay.id = a.academic_year_id
	WHERE a.graduate_year IS NOT NULL
	GROUP BY 1
	ORDER BY 1 DESC`

const ROW_SELECT = `SELECT a.id::text AS id, a.attach_photo, a.fullname, a.alumni_phone::text AS alumni_phone,
		p.name AS province_name, r.name AS regency_name, a.alumni_talent
	FROM tbr_alumnis a
	LEFT JOIN tbr_academic_years ay ON ay.id = a.academic_year_id
	LEFT JOIN tbr_provinces p ON p.id = a.alumni_province_id
	LEFT JOIN tbr_regencies r ON r.id = a.alumni_regency_id`

/** `listArchive()` (107-135): alumni of the Archive academic year (id 1). Legacy has no ORDER BY; id order. */
export const ALUMNI_ARCHIVE_SQL = `${ROW_SELECT}
	WHERE ay.id = 1
	ORDER BY a.id`

/** `listByYear()` (155-183): one graduation year, archive rows excluded. */
export const ALUMNI_BY_YEAR_SQL = `${ROW_SELECT}
	WHERE ${LIVE_YEAR} AND ${YEAR} = $1
	ORDER BY a.id`

/**
 * `AlumniExport` (`Alumni::whereYear(...)->latest()->get()`): every alumnus of the year — archive rows
 * included, unlike the page — newest `created_at` first (Postgres puts NULLs first on DESC, as legacy did).
 */
export const ALUMNI_EXPORT_SQL = `SELECT a.fullname, a.alumni_phone::text AS alumni_phone, p.name AS province_name,
		r.name AS regency_name, a.alumni_talent
	FROM tbr_alumnis a
	LEFT JOIN tbr_provinces p ON p.id = a.alumni_province_id
	LEFT JOIN tbr_regencies r ON r.id = a.alumni_regency_id
	WHERE ${YEAR} = $1
	ORDER BY a.created_at DESC, a.id DESC`

/** `edit()` widget + the alumni tab (`alumni/partials/edit/{widget-info,data/alumni}.blade.php`). */
export const ALUMNI_DETAIL_SQL = `SELECT a.id::text AS id, a.attach_photo, a.fullname, ay.year AS academic_year,
		to_char(a.graduate_year AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI') AS graduated_local,
		a.alumni_talent, a.advanced_study, a.profession, a.marriage_status, a.alumni_phone::text AS alumni_phone,
		a.alumni_email, a.alumni_province_id::text AS alumni_province_id, a.alumni_regency_id::text AS alumni_regency_id,
		a.alumni_district_id::text AS alumni_district_id, a.alumni_village, a.alumni_sub_village, a.alumni_rt,
		a.alumni_rw, a.alumni_street
	FROM tbr_alumnis a
	LEFT JOIN tbr_academic_years ay ON ay.id = a.academic_year_id
	WHERE a.id = $1`

/** Route-model binding for the writes; `FOR UPDATE` holds the row for the transaction. */
export const ALUMNI_LOCK_SQL = `SELECT id::text AS id, student_id::text AS student_id FROM tbr_alumnis WHERE id = $1 FOR UPDATE`

/**
 * `destroy()` step 1: `StudentGrade::find($alumni->student_id)` (live rows only, SoftDeletes) →
 * `update(['grade_status' => 'active', 'grade_note' => prev_grade_note])`. Eloquent writes (and touches
 * `updated_at`) only when something changed.
 */
export const RESTORE_GRADE_SQL = `UPDATE tbr_student_grades
	SET grade_status = 'active', grade_note = prev_grade_note, updated_at = now()
	WHERE id = $1 AND deleted_at IS NULL
		AND (grade_status IS DISTINCT FROM 'active' OR grade_note IS DISTINCT FROM prev_grade_note)`

/** The live grade row and its live account (`$student->student`), or nothing. */
export const GRADE_OWNER_SQL = `SELECT sg.id::text AS id, s.id::text AS student_id
	FROM tbr_student_grades sg
	LEFT JOIN tbr_students s ON s.id = sg.student_id AND s.deleted_at IS NULL
	WHERE sg.id = $1 AND sg.deleted_at IS NULL`

/** `destroy()` step 2: `$student->student->update(['is_blocked' => 0])` — a write only when it changes. */
export const UNBLOCK_STUDENT_SQL = `UPDATE tbr_students SET is_blocked = false, updated_at = now()
	WHERE id = $1 AND deleted_at IS NULL AND is_blocked IS DISTINCT FROM false
	RETURNING id`

/** `destroyByGraduationYear()` — every alumnus of the year, archive rows included (legacy quirk, kept). */
export const DELETE_YEAR_SQL = `DELETE FROM tbr_alumnis a WHERE ${YEAR} = $1`
