// Raw SQL for Biaya Santri levels 1–4, one statement per legacy query.
//
// Legacy walks these lists in PHP: `gradeList()` fires a COUNT per grade, `accountList()` fires
// one `first()` per accountancy and then one `StudentCost::where(...)` per cell renderer — three
// times over, since `getMaximumCost`, `getOptionCost` and `actionAccount` each re-query. Each of
// those becomes a single statement here; the comments name the PHP the expression replaces.
//
// **`student_cost_terms.grade` stores the Grade `label`, as text.** `store()`, `accountList()`,
// `actionAccount()`, `isAccountancyAppliedAll()` and `applied()` all read it that way; only
// `gradeList()`, the `store()` re-fetch, `edit()` and `update()` read it as the grade **id**.
// `grades.id == grades.label` for all seven rows today, so both work and no test can tell them
// apart — every statement below uses the **label**, which is also what the out-of-scope
// Kesanggupan module reads (plan decision).

import type { EntityManager } from "typeorm"

import { StudentCapability } from "@santri/entities/student-capability.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { Student } from "@santri/entities/student.entity"

/**
 * `AcademicYearService::getStatusAkademik()`, flattened — the same expression the Tahun Ajaran
 * list uses, duplicated rather than shared so the two modules stay independent.
 *
 * Legacy walks three branches on `now()` (app timezone Asia/Jakarta) against the cost period and
 * short-circuits to green "Berjalan" inside every one of them when `is_current` is set, so a
 * period that has already ended is the only case that renders anything else. The `id == 1`
 * branch is keyed on `year = 'Archive'`; they coincide in this database.
 */
const STATUS_AKADEMIK = `CASE
			WHEN ay.year = 'Archive' THEN 'none'
			WHEN ay.is_current THEN 'berjalan'
			WHEN ay.cost_date_end IS NOT NULL
				AND (now() AT TIME ZONE 'Asia/Jakarta') > ay.cost_date_end::timestamp THEN 'berakhir'
			ELSE 'empty'
		END`

/**
 * Level 1 — `academicYearList()`: `AcademicYear::exceptArchive()->orderBy('year', 'desc')`.
 *
 * A plain text sort on `year`; every value is `YYYY/YYYY`, so it is also the numeric order.
 * `ay.id ASC` is the tie-break legacy leaves to insertion order.
 */
export const STUDENT_COST_YEARS_SQL = `SELECT ay.id,
		ay.year,
		to_char(ay.cost_date_start, 'YYYY-MM-DD') AS "costDateStart",
		to_char(ay.cost_date_end, 'YYYY-MM-DD') AS "costDateEnd",
		${STATUS_AKADEMIK} AS "statusAkademik"
	FROM tbr_academic_years ay
	WHERE ay.year IS DISTINCT FROM 'Archive'
	ORDER BY ay.year DESC, ay.id ASC`

/**
 * Level 2 — `gradeList()`: `Grade::orderByDesc('label')->get()`, **every** grade, not just the
 * ones whose level belongs to the academic year, plus the per-grade applied count.
 *
 * `applied` is a nullable boolean, so legacy's `'applied' => 1` also excludes the NULL rows a
 * freshly stored term carries.
 */
export const STUDENT_COST_GRADES_SQL = `SELECT g.id AS "gradeId",
		g.label,
		(
			SELECT COUNT(*) FROM tbr_student_cost_terms t
			 WHERE t.academic_year_id = $1 AND t.grade = g.label::text AND t.applied
		)::int AS "appliedCount"
	FROM tbr_grades g
	ORDER BY g.label DESC, g.id DESC`

/** The level-2 and level-3 page headers: the year plus its cost period. */
export const STUDENT_COST_YEAR_SQL = `SELECT ay.id,
		ay.year,
		to_char(ay.cost_date_start, 'YYYY-MM-DD') AS "costDateStart",
		to_char(ay.cost_date_end, 'YYYY-MM-DD') AS "costDateEnd"
	FROM tbr_academic_years ay
	WHERE ay.id = $1`

/**
 * Level 3 — `accountList()`: `Accountancy::whereNotNull('parent_id')->where('is_student_cost', 1)`
 * joined to this year+grade's term, if any.
 *
 * `ORDER BY a.id` is **added**: legacy's `->get()` is unordered, which MySQL happened to return
 * in primary-key order and Postgres does not have to. The order is user-visible — it is the `$no`
 * counter and the default sort of the table.
 *
 * `parent_id` is a `varchar`, and legacy's Akun create page posts `parent_id=""` for a root
 * account, so `IS NOT NULL` keeps such a row here while the Akun tree drops it. Kept as legacy;
 * no row is in that state today.
 */
export const STUDENT_COST_ACCOUNTS_SQL = `SELECT a.id AS "accountancyId",
		a.name,
		a.note,
		t.id AS "termId",
		COALESCE(t.applied, false) AS applied,
		t.type,
		t.period,
		t.time_span AS "timeSpan",
		t.month_of AS "monthOf",
		t.day_of AS "dayOf",
		t.reminder,
		t.grade
	FROM tbr_accountancies a
	LEFT JOIN LATERAL (
		SELECT st.id, st.applied, st.type, st.period, st.time_span, st.month_of, st.day_of, st.reminder, st.grade
		  FROM tbr_student_cost_terms st
		 WHERE st.accountancy_id = a.id AND st.academic_year_id = $1 AND st.grade = $2
		 ORDER BY st.id
		 LIMIT 1
	) t ON TRUE
	WHERE a.parent_id IS NOT NULL AND a.is_student_cost
	ORDER BY a.id`

/**
 * `StudentCostService::isAccountancyAppliedAll()` — the header check-all box's initial state.
 * True only when the year+grade has at least one term and every one of them is applied.
 */
export const STUDENT_COST_APPLIED_TOTALS_SQL = `SELECT COUNT(*)::int AS total,
		COUNT(*) FILTER (WHERE t.applied)::int AS applied
	FROM tbr_student_cost_terms t
	WHERE t.academic_year_id = $1 AND t.grade = $2`

/**
 * `edit()`'s `$applies` probe, which disables the Periode radios once a kesanggupan is approved.
 *
 * Legacy compares `student_grades.grade` to `$grade->level` — the `level()` **relation**, i.e. a
 * `Level` model object, since `grades` has `level_id` and no `level` column. The intent is clear
 * ("does an approved kesanggupan already exist for this year and grade?"), so the port compares
 * against the grade label, which is what `student_grades.grade` holds (plan decision).
 *
 * No `deleted_at` filter: legacy builds this with the query builder, not the `StudentGrade`
 * model, so its `SoftDeletes` scope never applies.
 */
export const isPeriodLocked = (
	manager: EntityManager,
	year: string | null,
	grade: number | null,
): Promise<boolean> =>
	manager
		.createQueryBuilder(StudentCapability, "sc")
		.leftJoin(Student, "s", "s.id = sc.studentId")
		.leftJoin(StudentGrade, "sg", "sg.studentId = s.id")
		.where("sc.status = 'approve'")
		.andWhere("sg.currentAcademicYear = :year", { year })
		.andWhere("sg.grade = :grade", { grade })
		.getExists()

// ─── Writes ─────────────────────────────────────────────────────────────────────

/**
 * `applied()`, scoped.
 *
 * Legacy's `StudentCostTerm::whereIn('id', $request->id)` is **not** scoped to the academic year
 * or grade, so any term id posted from anywhere in the table was flipped to applied; the year and
 * grade only ever constrained the *clearing* query. Both halves are scoped here (plan decision).
 *
 * `applied IS DISTINCT FROM …` reproduces Eloquent's `isDirty()` short-circuit: `$model->update()`
 * issues no statement when nothing changed, so legacy leaves `updated_at` alone on rows that were
 * already in the target state.
 */
export const STUDENT_COST_APPLY_SQL = `UPDATE tbr_student_cost_terms
	   SET applied = true, updated_at = now()
	 WHERE academic_year_id = $1 AND grade = $2 AND id = ANY($3::bigint[])
	   AND applied IS DISTINCT FROM true`

export const STUDENT_COST_UNAPPLY_SQL = `UPDATE tbr_student_cost_terms
	   SET applied = false, updated_at = now()
	 WHERE academic_year_id = $1 AND grade = $2 AND NOT (id = ANY($3::bigint[]))
	   AND applied IS DISTINCT FROM false`
