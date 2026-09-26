import { TIMEZONE } from "@admin/common/sql"

// Raw SQL for the read half of Akademik → Santri — legacy `StudentController` `academicYearList:62`,
// `gradeList:111`, `students:288`, `studentList:317`, `edit:397` and the select lists of the wizard
// (`Student\PersonalController::personal`) and the edit page.
//
// `tbr_students` and `tbr_student_grades` are soft-deleted (`deleted_at`): every read filters it, as the
// Eloquent `SoftDeletes` scope does. `StudentGrade::student()` is `hasOne(...)->withDefault()`, so the
// account is LEFT JOINed on a live row — a trashed or missing account reads as an empty model.

/**
 * `AcademicYearService::getStatusAkademik()`, flattened (same reading as `capabilities/capability-sql.ts`):
 * id 1 → "-", `is_current` → "Berjalan" in every branch, an ended period → "Berakhir", else nothing.
 */
const STATUS_AKADEMIK = `CASE
			WHEN ay.id = 1 THEN '-'
			WHEN ay.is_current THEN 'Berjalan'
			WHEN ay.cost_date_end IS NOT NULL
				AND (now() AT TIME ZONE '${TIMEZONE}') > ay.cost_date_end::timestamp THEN 'Berakhir'
			ELSE NULL
		END`

/**
 * `academicYearList:62-94`. Legacy sorts the collection by the first run of digits in `year`, descending
 * (`preg_match('/\d+/')`, "Archive" → 0); PHP 8's stable sort keeps `get()`'s order for ties (id).
 * The three counts use `groupBy(...)->pluck()->count()`, so a NULL level or grade is a group of its own.
 */
export const YEAR_LIST_SQL = `SELECT ay.id, ay.year,
		(SELECT COUNT(*) FROM (SELECT 1 FROM tbr_student_grades sg
			WHERE sg.deleted_at IS NULL AND sg.current_academic_year = ay.year GROUP BY sg.level_id) t)::int AS "levelCount",
		(SELECT COUNT(*) FROM (SELECT 1 FROM tbr_student_grades sg
			WHERE sg.deleted_at IS NULL AND sg.current_academic_year = ay.year GROUP BY sg.grade) t)::int AS "gradeCount",
		(SELECT COUNT(*) FROM tbr_student_grades sg
			WHERE sg.deleted_at IS NULL AND sg.current_academic_year = ay.year)::int AS "studentCount",
		${STATUS_AKADEMIK} AS "statusLabel"
	FROM tbr_academic_years ay
	ORDER BY COALESCE(substring(ay.year from '[0-9]+')::bigint, 0) DESC, ay.id ASC`

export const YEAR_SQL = `SELECT ay.id, ay.year FROM tbr_academic_years ay WHERE ay.id = $1`

/**
 * `gradeList:111-152`: the distinct (grade, level_id) pairs of the year, grade descending, with the four
 * counts legacy takes off the year's rows. `->with('level')` + `withDefault()` → a missing level has no name.
 */
export const GRADE_LIST_SQL = `SELECT p.grade, p.level_id AS "levelId", l.name AS "levelName",
		COUNT(*)::int AS total,
		COUNT(*) FILTER (WHERE sg.grade_status = 'active')::int AS active,
		COUNT(*) FILTER (WHERE sg.grade_note = 'naik kelas')::int AS "naikKelas",
		COUNT(*) FILTER (WHERE sg.grade_note = 'tinggal kelas')::int AS "tinggalKelas"
	FROM (SELECT DISTINCT grade, level_id FROM tbr_student_grades
			WHERE deleted_at IS NULL AND current_academic_year = $1) p
	JOIN tbr_student_grades sg ON sg.deleted_at IS NULL AND sg.current_academic_year = $1
		AND sg.grade IS NOT DISTINCT FROM p.grade AND sg.level_id IS NOT DISTINCT FROM p.level_id
	LEFT JOIN tbr_levels l ON l.id = p.level_id
	GROUP BY p.grade, p.level_id, l.name
	ORDER BY p.grade DESC NULLS FIRST, p.level_id ASC`

/** `students:290-296` — the roster exists only while the class has a live row. */
export const ROSTER_EXISTS_SQL = `SELECT EXISTS (SELECT 1 FROM tbr_student_grades
		WHERE deleted_at IS NULL AND current_academic_year = $1 AND grade = $2 AND level_id = $3) AS exists`

/** `Grade::all()->pluck('label')` → `max()` (empty → 0) */
export const MAX_GRADE_SQL = `SELECT COALESCE(MAX(label), 0)::int AS "maxGrade" FROM tbr_grades`

export const LEVEL_NAME_SQL = `SELECT name FROM tbr_levels WHERE id = $1`

export const MAJORS_OF_LEVEL_SQL = `SELECT name FROM tbr_majors WHERE level_id = $1 ORDER BY id`

export const SUB_GRADES_SQL = `SELECT label FROM tbr_sub_grades ORDER BY id`

/**
 * `studentList:317-354`: `->latest()->get()` (created_at desc; `id` breaks ties). The photo, the date and
 * the parent cell are shaped in `student-format.ts`.
 */
export const ROSTER_SQL = `SELECT sg.id, sg.student_id AS "studentId", s.nis, s.is_blocked AS "isBlocked",
		sg.fullname, sg.attach_photo AS "attachPhoto", to_char(sg.date_of_birth, 'YYYY-MM-DD') AS "dateOfBirth",
		COALESCE(sg.father_fullname, sg.mother_fullname) AS "parentName",
		sg.major_name AS "majorName", sg.sub_grade AS "subGrade", sg.grade_status AS "gradeStatus",
		sg.grade_note AS "gradeNote", sg.dropout_note AS "dropoutNote"
	FROM tbr_student_grades sg
	LEFT JOIN tbr_students s ON s.id = sg.student_id AND s.deleted_at IS NULL
	WHERE sg.deleted_at IS NULL AND sg.current_academic_year = $1 AND sg.grade = $2 AND sg.level_id = $3
	ORDER BY sg.created_at DESC NULLS LAST, sg.id DESC`

/** `edit:397-420` — the widget, summary and right-panel fields (the society form comes from `loadSocietyRecord`). */
export const DETAIL_SQL = `SELECT sg.id, sg.student_id AS "studentId", s.nis, s.email, s.source, s.is_blocked AS "isBlocked",
		sg.fullname, sg.level_id AS "levelId", l.name AS "levelName", sg.grade, sg.grade_status AS "gradeStatus",
		sg.grade_note AS "gradeNote", sg.dropout_note AS "dropoutNote", sg.sub_grade AS "subGrade",
		sg.major_name AS "majorName", sg.current_academic_year AS "currentAcademicYear", sg.attach_photo AS "attachPhoto",
		(SELECT ay.id FROM tbr_academic_years ay WHERE ay.year = sg.current_academic_year ORDER BY ay.id LIMIT 1) AS "academicYearId",
		to_char(sg.created_at AT TIME ZONE '${TIMEZONE}', 'DD') AS "createdDay",
		to_char(sg.created_at AT TIME ZONE '${TIMEZONE}', 'FMMM') AS "createdMonth",
		to_char(sg.created_at AT TIME ZONE '${TIMEZONE}', 'YYYY') AS "createdYear",
		to_char(sg.created_at AT TIME ZONE '${TIMEZONE}', 'HH24:MI') AS "createdTime"
	FROM tbr_student_grades sg
	LEFT JOIN tbr_students s ON s.id = sg.student_id AND s.deleted_at IS NULL
	LEFT JOIN tbr_levels l ON l.id = sg.level_id
	WHERE sg.id = $1 AND sg.deleted_at IS NULL`

// ─── Select lists ────────────────────────────────────────────────────────────

export const OPTION_YEARS_SQL = `SELECT id, year FROM tbr_academic_years ORDER BY id`
export const OPTION_LEVELS_SQL = `SELECT id, name FROM tbr_levels ORDER BY created_at DESC NULLS LAST, id DESC`
export const OPTION_GRADES_SQL = `SELECT id, label, level_id AS "levelId" FROM tbr_grades ORDER BY label ASC, id ASC`
export const OPTION_SUB_GRADES_SQL = `SELECT label FROM tbr_sub_grades ORDER BY created_at DESC NULLS LAST, id DESC`
export const OPTION_MAJORS_SQL = `SELECT name, level_id AS "levelId" FROM tbr_majors ORDER BY id`

// ─── Export (`StudentExport::view`) ──────────────────────────────────────────

export const EXPORT_SETTINGS_SQL = `SELECT id, COALESCE(status, false) AS status, COALESCE(custom_name, "default", '') AS label
	FROM tbr_setting_forms ORDER BY id`

/**
 * The export's rows, in the roster's order. `SocietyGetterTrait::getFullAddress()` (RT and RW swapped, kept):
 * "-" without a province, otherwise `street, RT <rw>, RW <rt>, Dusun …, Kelurahan …, Kecamatan <district>,
 * <regency>, Provinsi <province>`, where a location the id does not find renders as "" (the helpers' catch).
 */
export const EXPORT_SQL = `SELECT s.nis, s.email, sg.nisn, sg.fullname, sg.place_of_birth AS "placeOfBirth",
		to_char(sg.date_of_birth, 'YYYY-MM-DD') AS "dateOfBirth",
		CASE WHEN COALESCE(sg.province_id, 0) = 0 THEN '-' ELSE
			COALESCE(sg.street, '') || ', RT ' || COALESCE(sg.rw, '') || ', RW ' || COALESCE(sg.rt, '')
			|| ', Dusun ' || COALESCE(sg.sub_village, '') || ', Kelurahan ' || COALESCE(sg.village, '') || ', '
			|| CASE WHEN d.id IS NULL THEN '' ELSE 'Kecamatan ' || COALESCE(d.name, '') END || ', '
			|| COALESCE(r.name, '') || ', '
			|| CASE WHEN p.id IS NULL THEN '' ELSE 'Provinsi ' || COALESCE(p.name, '') END
		END AS address,
		sg.sibling_order::text AS "siblingOrder", sg.number_of_sibling::text AS "numberOfSibling",
		sg.parent_status AS "parentStatus", sg.blood_type AS "bloodType", sg.school_name AS "schoolName",
		sg.father_fullname AS "fatherFullname", sg.father_phone::text AS "fatherPhone",
		sg.father_last_education AS "fatherLastEducation", sg.father_job AS "fatherJob",
		sg.mother_fullname AS "motherFullname", sg.mother_phone::text AS "motherPhone",
		sg.mother_last_education AS "motherLastEducation", sg.mother_job AS "motherJob",
		sg.guardian_fullname AS "guardianFullname", sg.guardian_phone::text AS "guardianPhone",
		l.name AS "levelName"
	FROM tbr_student_grades sg
	LEFT JOIN tbr_students s ON s.id = sg.student_id AND s.deleted_at IS NULL
	LEFT JOIN tbr_levels l ON l.id = sg.level_id
	LEFT JOIN tbr_districts d ON d.id = sg.district_id
	LEFT JOIN tbr_regencies r ON r.id = sg.regency_id
	LEFT JOIN tbr_provinces p ON p.id = sg.province_id
	WHERE sg.deleted_at IS NULL AND sg.current_academic_year = $1 AND sg.grade = $2 AND sg.level_id = $3
	ORDER BY sg.created_at DESC NULLS LAST, sg.id DESC`
