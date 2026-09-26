import { EPOCH_SECONDS, LOCAL_TIMESTAMP } from "@admin/common/sql"

// Raw SQL behind the Jenjang page and its delete/delegation chain — legacy
// `LevelController` + `app/Http/Services/LevelService.php`.
//
// Every statement here is set-based. Legacy looped `foreach ($level->majors as $major)
// { $major->update(...) }` with no transaction at all (B-8/B-9); the service wraps the
// whole chain in one and issues a single UPDATE per table.
//
// Soft deletes: `StudentGrade` uses `SoftDeletes`, so `$level->studentGrades` and its
// `->count()` both see `deleted_at IS NULL` only. `Major`, `Grade` and `Registrant` have
// no `deleted_at` column at all.

export type LevelSqlRow = {
	id: string
	name: string | null
	status: "show" | "hide" | null
	localCreatedAt: string | null
	createdAtTs: string | null
	majorCount: string
	gradeCount: string
	registrantCount: string
	studentGradeCount: string
}

/** The four counts `LevelService::delegateAction` tests, in the order it tests them. */
const CHILD_COUNTS = `(SELECT count(*) FROM tbr_majors m WHERE m.level_id = l.id) AS "majorCount",
		(SELECT count(*) FROM tbr_grades g WHERE g.level_id = l.id) AS "gradeCount",
		(SELECT count(*) FROM tbr_registrants r WHERE r.level_id = l.id) AS "registrantCount",
		(SELECT count(*) FROM tbr_student_grades sg
			WHERE sg.level_id = l.id AND sg.deleted_at IS NULL) AS "studentGradeCount"`

/**
 * Legacy `@list`: `Level::latest()->get()`, i.e. `ORDER BY created_at DESC`. The `id DESC`
 * tiebreak is ours — Postgres leaves equal timestamps in an arbitrary order, and the row
 * numbers on the page have to be stable between two draws.
 */
export const LEVEL_LIST_SQL = `SELECT l.id, l.name, l.status,
		${LOCAL_TIMESTAMP("l.created_at")} AS "localCreatedAt",
		${EPOCH_SECONDS("l.created_at")} AS "createdAtTs",
		${CHILD_COUNTS}
	FROM tbr_levels l
	ORDER BY l.created_at DESC, l.id DESC`

/** One level plus the same counts — backs `findOne` and every `delete-step` page. */
export const LEVEL_BY_ID_SQL = `SELECT l.id, l.name, l.status,
		${LOCAL_TIMESTAMP("l.created_at")} AS "localCreatedAt",
		${EPOCH_SECONDS("l.created_at")} AS "createdAtTs",
		${CHILD_COUNTS}
	FROM tbr_levels l
	WHERE l.id = $1`

/**
 * Legacy `createQuota()`: `$level->academicYears()->attach(AcademicYear::pluck('id'))`.
 * One pivot row per academic year, `quota` left at the column default of 0. `attach()`
 * writes no timestamps, so neither do we.
 */
export const LEVEL_CREATE_QUOTA_SQL = `INSERT INTO tbr_level_academic_years (level_id, academic_year_id, quota)
	SELECT $1, y.id, 0 FROM tbr_academic_years y`

// ─── The delegation moves ────────────────────────────────────────
// $1 = the level being deleted, $2 = the destination chosen in the picker.

export const MOVE_REGISTRANTS_SQL = `UPDATE tbr_registrants SET level_id = $2, updated_at = now() WHERE level_id = $1`

/**
 * B-2. Legacy iterated `$level->students` and `Level` has no `students()` relation, so the
 * step threw, the `try` swallowed it and the level survived — the path never once worked in
 * production. `tbr_students` has no `level_id` column at all; the rows that carry the level
 * are `tbr_student_grades`, which is what `Level::studentGrades()` already points at.
 *
 * Scoped to `deleted_at IS NULL` so the UPDATE covers exactly the rows the relation (and the
 * count that routed the user here) sees.
 */
export const MOVE_STUDENT_GRADES_SQL = `UPDATE tbr_student_grades SET level_id = $2, updated_at = now()
	WHERE level_id = $1 AND deleted_at IS NULL`

/**
 * Legacy `updateQuota($request, $level)`: for every academic year the **destination** level
 * takes part in, add the source level's quota for that same year onto the destination pivot.
 *
 * B-2b: legacy wrote `$level->academicYears->where('id', $y->id)->first()->pivot->quota`
 * with no null guard, so a source level with no pivot row for one of those years threw —
 * level 3 is in exactly that state today (zero pivot rows). The join drops those years
 * instead, which is the "+ 0" the guard would have produced.
 *
 * The join also cannot double-count: each destination pivot row matches at most one source
 * pivot row per academic year, so `quota` is incremented once.
 */
export const UPDATE_QUOTA_SQL = `UPDATE tbr_level_academic_years d
	SET quota = COALESCE(d.quota, 0) + COALESCE(s.quota, 0), updated_at = now()
	FROM tbr_level_academic_years s
	WHERE d.level_id = $2 AND s.level_id = $1 AND s.academic_year_id = d.academic_year_id`
