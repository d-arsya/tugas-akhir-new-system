// Raw SQL for the read half of Kesanggupan — legacy `StudentCapabilityController`
// `@academicYearList`, `@gradeList`, `@capabilityList`, `@studentCapabilityList`,
// `@studentCapabilityItemList`, `@print` and `@downloadPDF`.
//
// **Nothing here INNER JOINs `tbr_accountancies`.** That table has no `deleted_at` and six of its
// ids were hard-deleted, so 54 capability line items point at nothing; an inner join would drop
// them from the item counts and from both documents. Every reference below is a LEFT JOIN, and a
// count that legacy took off an inner-joined relation is reproduced as `COUNT(*) FILTER (…)`,
// which yields the same number without losing the row.
//
// None of these lists is paged: legacy hand-builds the whole `['data' => …]` array and the browser
// pages it, so each statement returns its complete set.

import { LOCAL_TIMESTAMP, TIMEZONE, truthy } from "@admin/common/sql"

// ─── Level 1: academic years (`@academicYearList`) ───────────────────────────

/**
 * `AcademicYearService::getStatusAkademik()`, flattened.
 *
 * Legacy walks three `now()` branches against the cost period and short-circuits to green
 * "Berjalan" inside every one of them when `is_current` is set, so an ended period on a
 * non-current year is the only case that renders anything else; the other two render `""`, and a
 * period boundary hit exactly falls off the end of the function and returns `null`. Both collapse
 * to SQL NULL, which the contract's `statusLabel` carries as "no badge".
 *
 * The `id == 1` branch renders the literal "-". `exceptArchive()` filters on `year`, not on the
 * id, so the two only coincide because row 1 is the `year = 'Archive'` sentinel — the branch is
 * kept anyway, since it is what the contract's "-" means.
 */
const STATUS_AKADEMIK = `CASE
			WHEN ay.year = 'Archive' THEN '-'
			WHEN ay.is_current THEN 'Berjalan'
			WHEN ay.cost_date_end IS NOT NULL
				AND (now() AT TIME ZONE '${TIMEZONE}') > ay.cost_date_end::timestamp THEN 'Berakhir'
			ELSE NULL
		END`

/**
 * `AcademicYear::exceptArchive()->orderBy('year', 'desc')->get()`.
 *
 * A plain text sort on `year`; every live value is `YYYY/YYYY`, so it is also the numeric order.
 * `ay.id ASC` is the tie-break legacy leaves to insertion order.
 */
export const CAPABILITY_YEARS_SQL = `SELECT ay.id,
		ay.year,
		to_char(ay.cost_date_start, 'YYYY-MM-DD') AS "costDateStart",
		to_char(ay.cost_date_end, 'YYYY-MM-DD') AS "costDateEnd",
		${STATUS_AKADEMIK} AS "statusLabel"
	FROM tbr_academic_years ay
	WHERE ay.year IS DISTINCT FROM 'Archive'
	ORDER BY ay.year DESC, ay.id ASC`

// ─── Level 2: grades of one year (`@gradeList`) ──────────────────────────────

/**
 * `Grade::orderByDesc('label')->get()` — **every** grade, not just those whose level belongs to
 * the year, plus the two per-grade probes legacy fires one query at a time.
 *
 * `studentCount` is `Grade::getTotalStudentGrade()`, which filters `grade_status = 'active'`.
 * Level 3 deliberately does **not**, so the two numbers disagree: for 2025/2026 grade 1 this
 * counts 6 while the santri list below returns 43 rows. Replicated, not fixed (brief §5).
 *
 * `student_cost_terms.grade` is a `varchar` holding the grade **label**; `grades.label` and
 * `student_grades.grade` are both `bigint`. Every comparison casts explicitly.
 */
export const CAPABILITY_GRADES_SQL = `SELECT g.id,
		g.label,
		EXISTS (
			SELECT 1 FROM tbr_student_cost_terms t
			 WHERE t.academic_year_id = $1 AND t.grade = g.label::text AND t.applied
		) AS "masterCostDefined",
		(
			SELECT COUNT(*) FROM tbr_student_grades sg
			 WHERE sg.current_academic_year = $2
			   AND sg.grade_status = 'active'
			   AND sg.grade = g.label
			   AND sg.deleted_at IS NULL
		)::int AS "studentCount"
	FROM tbr_grades g
	ORDER BY g.label DESC, g.id DESC`

/** `@capability`'s guard: no applied term for this year+grade and the page redirects to level 2. */
export const CAPABILITY_TERMS_EXIST_SQL = `SELECT EXISTS (
		SELECT 1 FROM tbr_student_cost_terms t
		 WHERE t.academic_year_id = $1 AND t.grade = $2 AND t.applied
	) AS exists`

// ─── Level 3: santri of one grade (`@capabilityList`) ────────────────────────

/**
 * `StudentGrade::where(['current_academic_year' => …, 'grade' => …])->latest()->get()`.
 *
 * `latest()` orders by `created_at` descending; `sg.id DESC` is the tie-break legacy leaves to
 * whatever the driver returns. No `grade_status` filter — see the note on `CAPABILITY_GRADES_SQL`.
 *
 * `hasCapability` replaces the hidden `<span class='d-none'>Sudah|Belum memiliki kesanggupan</span>`
 * that `StudentGrade::getStudentCapabilityCountAttribute()` prefixes to the cell; legacy's filter
 * dropdown and its red-row `rowCallback` both string-match that span, which is exactly the coupling
 * the contract removes.
 */
export const CAPABILITY_STUDENTS_SQL = `SELECT sg.id AS "studentGradeId",
		s.nis,
		sg.fullname AS "fullName",
		CASE WHEN ${truthy("sg.father_fullname")} THEN sg.father_fullname ELSE sg.mother_fullname END AS "parentOrGuardian",
		sg.sub_grade AS "subGrade",
		(
			SELECT COUNT(*) FROM tbr_student_capabilities c WHERE c.student_grade_id = sg.id
		)::int AS "capabilityCount"
	FROM tbr_student_grades sg
	LEFT JOIN tbr_students s ON s.id = sg.student_id
	WHERE sg.current_academic_year = $1 AND sg.grade = $2 AND sg.deleted_at IS NULL
	ORDER BY sg.created_at DESC, sg.id DESC`

// `@storeToSession` — the tick list the level-3 page parks before the mass pages read it back out
// of the query string — lives in `mass-sql.ts`: it is the mass write's own scope check, and P2-C
// owns that file. Nothing here duplicates it.

// ─── Level 4: one santri's history (`@studentCapability*`) ───────────────────

/**
 * The card down the left of levels 4 and 5, plus the two ids the breadcrumb and the back button
 * need. Legacy resolves those with `getAcademicYearId($sg->current_academic_year)` and
 * `getGradeId($sg->grade)`, each of which is an unguarded `->first()->id`; the LEFT JOINs here
 * return NULL instead of a fatal when the year or the grade row is missing.
 *
 * The academic year on the card hangs off the **student** (`$studentGrade->student->academicYear`),
 * which is a different column from `student_grades.current_academic_year` used for the lookup.
 */
export const CAPABILITY_STUDENT_CARD_SQL = `SELECT sg.id AS "studentGradeId",
		s.id AS "studentId",
		s.nis,
		sg.fullname AS "fullName",
		sg.attach_photo AS "photoPath",
		ay.year AS "academicYear",
		l.name AS "levelName",
		sg.grade::text AS grade,
		sg.sub_grade AS "subGrade",
		sg.father_fullname AS "fatherName",
		sg.current_academic_year AS "currentAcademicYear",
		cay.id AS "costAcademicYearId",
		g.id AS "gradeId"
	FROM tbr_student_grades sg
	LEFT JOIN tbr_students s ON s.id = sg.student_id
	LEFT JOIN tbr_levels l ON l.id = sg.level_id
	LEFT JOIN tbr_academic_years ay ON ay.id = s.academic_year_id
	LEFT JOIN tbr_academic_years cay ON cay.year = sg.current_academic_year
	LEFT JOIN tbr_grades g ON g.label = sg.grade
	WHERE sg.id = $1 AND sg.deleted_at IS NULL`

/**
 * `$student_grade->studentCapabilities()->oldest()->get()` — the whole history, oldest first,
 * which is also the `#1`, `#2` ordinal legacy bakes into the first column.
 *
 * `itemCount` is `count($capability->accountancies->whereNotNull('parent_id')->where('is_student_cost', 1))`.
 * That relation is a `belongsToMany`, i.e. an inner join, so a hard-deleted accountancy is already
 * absent from legacy's count; `COUNT(*) FILTER` over a LEFT JOIN gives the same number without
 * letting the join decide which rows exist.
 */
export const CAPABILITY_HISTORY_SQL = `SELECT c.id,
		${LOCAL_TIMESTAMP("c.approve_date")} AS "approveDate",
		EXTRACT(EPOCH FROM c.approve_date)::bigint AS "approveDateTs",
		c.status,
		c.note,
		(
			SELECT COUNT(*) FILTER (WHERE a.parent_id IS NOT NULL AND a.is_student_cost)
			  FROM tbr_student_cost_capabilities scc
			  LEFT JOIN tbr_accountancies a ON a.id = scc.accountancy_id
			 WHERE scc.student_cap_id = c.id
		)::int AS "itemCount"
	FROM tbr_student_capabilities c
	WHERE c.student_grade_id = $1
	ORDER BY c.created_at ASC, c.id ASC`

/**
 * `$student_grade->studentCapabilities()->latest()->first()->status` — which banner level 4 shows.
 *
 * `latest()` is `created_at` descending, not the highest id. The two agree on every one of the
 * 1,050 live student_grades that hold a capability (verified), but the ordering legacy actually
 * wrote is the one reproduced.
 */
export const CAPABILITY_NEWEST_STATUS_SQL = `SELECT c.status
	FROM tbr_student_capabilities c
	WHERE c.student_grade_id = $1
	ORDER BY c.created_at DESC, c.id DESC
	LIMIT 1`

// ─── Level 5: the line items (`@studentCapabilityItem*`) ─────────────────────

/** One capability, for the header badge and the `(capability, studentGrade)` pair guard. */
export const CAPABILITY_SQL = `SELECT c.id,
		c.student_grade_id AS "studentGradeId",
		c.status,
		c.note,
		${LOCAL_TIMESTAMP("c.approve_date")} AS "approveDate",
		(
			SELECT COUNT(*) FROM tbr_student_capabilities o
			 WHERE o.student_grade_id = c.student_grade_id
			   AND (o.created_at, o.id) <= (c.created_at, c.id)
		)::int AS ordinal
	FROM tbr_student_capabilities c
	WHERE c.id = $1`

/**
 * `@studentCapabilityItemList` — the applied cost terms of the santri's year and grade, narrowed
 * to the accounts the capability actually carries once it is no longer `disapprove`.
 *
 * `$3` is the narrowing switch: `true` while the capability is still unagreed, which makes the
 * `EXISTS` clause pass unconditionally and lists every applied term, exactly as legacy's `if`
 * branch does.
 *
 * `ORDER BY t.id` is **added**. Legacy's `->get()` is unordered, which MySQL happened to return in
 * primary-key order and Postgres does not have to; the order is user-visible — it is the `$no`
 * counter, the default sort and the index every modal was keyed on.
 *
 * `tbr_accountancies` is LEFT JOINed: six ids were hard-deleted and 18 cost terms point at them.
 */
export const CAPABILITY_ITEMS_SQL = `SELECT t.id AS "costTermId",
		t.accountancy_id AS "accountancyId",
		a.name,
		t.type,
		t.period,
		amounts.list AS "amounts",
		agreed.amount AS "agreedAmount",
		(agreed.id IS NOT NULL) AS "hasRow"
	FROM tbr_student_cost_terms t
	LEFT JOIN tbr_accountancies a ON a.id = t.accountancy_id
	LEFT JOIN LATERAL (
		SELECT array_agg(c.amount ORDER BY c.id) AS list
		  FROM tbr_student_costs c
		 WHERE c.stuco_term_id = t.id
	) amounts ON true
	LEFT JOIN LATERAL (
		SELECT scc.id, scc.amount
		  FROM tbr_student_cost_capabilities scc
		 WHERE scc.student_cap_id = $3 AND scc.accountancy_id = t.accountancy_id
		 ORDER BY scc.id
		 LIMIT 1
	) agreed ON true
	WHERE t.academic_year_id = $1
	  AND t.grade = $2
	  AND t.applied
	  AND (
		$4::boolean
		OR EXISTS (
			SELECT 1 FROM tbr_student_cost_capabilities scc
			 WHERE scc.student_cap_id = $3 AND scc.accountancy_id = t.accountancy_id
		)
	  )
	ORDER BY t.id`
