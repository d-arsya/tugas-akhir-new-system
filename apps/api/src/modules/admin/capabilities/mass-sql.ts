// Raw SQL for the bulk half of Kesanggupan — legacy `StudentCapabilityController@storeToSession`
// (141-190), `@massCreate*` (192-242), `@massStore` (244-300), `@massEdit*` (302-393) and
// `@massUpdate` (395-465), plus the `StudentCapabilityService` helpers those pages lean on
// (`isStudentGradeHasSameAccount`, `getAccountIdSame`, `getAccountIdNotShow`,
// `getUpdateCapabilityAmount`).
//
// Three data facts shape every statement here:
//
//  * **`tbr_accountancies` has no `deleted_at`** and six ids were hard-deleted, so it is only
//    ever LEFT JOINed and the name may come back null.
//  * **Grade is three different types.** `tbr_student_cost_terms.grade` is `varchar`,
//    `tbr_grades.label` and `tbr_student_grades.grade` are `bigint`. Every comparison casts.
//  * **node-postgres returns `bigint` as a string**, so all three `amount` columns, `label` and
//    `grade` arrive as text and are normalised through `toAmount()` / `Number()` in the service.
//
// `tbr_student_capabilities` and `tbr_student_cost_capabilities` carry no `deleted_at` at all —
// there is no soft delete to scope out, and no FK, UNIQUE or CHECK constraint anywhere.

// ─── Route context ───────────────────────────────────────────────────────────

/**
 * The academic year and grade named in the URL.
 *
 * Legacy route-model-binds both, so a missing id 404s before the action runs. Two legacy URLs
 * pass the grade **label** where the binding expects the **id** (`mass-create.blade.php:121`,
 * `mass-edit.blade.php:140`), which only ever worked because the seeder made `id == label`;
 * every route in the port takes the id, and `label` is read back out here for the cost-term
 * lookup, which genuinely keys on the label.
 */
export const SELECT_CONTEXT_SQL = `SELECT ay.id AS "academicYearId",
		ay.year,
		g.id AS "gradeId",
		g.label::text AS label
	FROM tbr_academic_years ay
	CROSS JOIN tbr_grades g
	WHERE ay.id = $1 AND g.id = $2`

// ─── The selection ───────────────────────────────────────────────────────────

/**
 * The ticked santri, re-read from the database rather than trusted from the request.
 *
 * Legacy kept the list in **one global session key**, so two tabs open on two grades shared it
 * and the second tab wrote the first tab's santri. The list travels in the request now, which
 * makes re-validation mandatory: `current_academic_year` and `grade` are returned so the service
 * can reject any santri who does not belong to the year and grade in the URL.
 *
 * `StudentGrade` uses `SoftDeletes`; the ordering is the port's own — legacy emitted no
 * `ORDER BY` and took whatever Postgres handed back.
 */
export const SELECT_SELECTION_SQL = `SELECT sg.id AS "studentGradeId",
		sg.student_id AS "studentId",
		sg.fullname AS "fullName",
		sg.current_academic_year AS "currentAcademicYear",
		sg.grade::text AS grade,
		s.nis
	FROM tbr_student_grades sg
	LEFT JOIN tbr_students s ON s.id = sg.student_id
	WHERE sg.id = ANY($1) AND sg.deleted_at IS NULL
	ORDER BY sg.id`

/**
 * `@storeToSession`'s two gates, in one pass.
 *
 * Legacy runs them as two separate `->get()` calls and only counts the result:
 * `status='disapprove'` for the first (`Terdapat kesanggupan yang belum disepakati.`) and
 * **any** status for the second, which only applies to `action='create'`
 * (`Terdapat santri yang sudah punya kesanggupan.`). The order matters — the first match wins.
 */
export const SELECT_SELECTION_CAPABILITY_STATE_SQL = `SELECT
		count(*) FILTER (WHERE c.status = 'disapprove')::int AS "disapproveCount",
		count(*)::int AS "anyCount"
	FROM tbr_student_capabilities c
	WHERE c.student_grade_id = ANY($1)`

// ─── Cost terms (the account table on both mass pages) ───────────────────────

/**
 * `StudentCostTerm::where(['academic_year_id' => …, 'grade' => $grade->label, 'applied' => 1])`.
 *
 * ⚠ `applied` is a **boolean** column. `applied = 1` raises
 * `operator does not exist: boolean = integer` in Postgres, which is why it is compared to
 * `true`; legacy got away with `1` because Eloquent bound it through PDO. The column is also
 * nullable (one live row), and `applied IS NULL` is correctly excluded by `= true`.
 *
 * `amounts` is `tbr_student_costs` in id order — the radio list for `type='option'` and, for
 * `type='maximum'`, a single row whose value is both the slider ceiling and
 * `StudentCostTerm::getAccountCostAttribute`. That accessor returns **null** when the term has
 * more than one cost, which is what makes an option row's amount cell legitimately empty.
 */
export const SELECT_COST_TERMS_SQL = `SELECT t.id AS "costTermId",
		t.accountancy_id AS "accountancyId",
		a.name,
		t.type,
		t.period,
		COALESCE(
			(SELECT array_agg(c.amount::text ORDER BY c.id) FROM tbr_student_costs c WHERE c.stuco_term_id = t.id),
			'{}'
		) AS amounts
	FROM tbr_student_cost_terms t
	LEFT JOIN tbr_accountancies a ON a.id = t.accountancy_id
	WHERE t.academic_year_id = $1 AND t.grade = $2 AND t.applied = true
	ORDER BY t.id`

// ─── The selected santri's current agreements ────────────────────────────────

/**
 * Every line item of the selected santri's **approved** capability.
 *
 * Legacy's helpers disagree with each other about how to find it: `isStudentGradeHasSameAccount`
 * looks it up by `student_grade_id` while `getAccountIdSame` and `getAccountIdNotShow` look it up
 * by `student_id`, so a santri with two enrolments feeds two different capabilities into the two
 * halves of the same decision. Everything here keys on `student_grade_id`, which is what the
 * rest of the menu keys on.
 *
 * Legacy also takes `->first()` with no ordering. No live santri has two `approve` rows (checked:
 * 0 of 1,050), but the `MIN(id)` tie-break makes the port deterministic if one ever appears.
 */
export const SELECT_APPROVED_ITEMS_SQL = `WITH current AS (
		SELECT DISTINCT ON (c.student_grade_id) c.student_grade_id, c.id
		FROM tbr_student_capabilities c
		WHERE c.status = 'approve' AND c.student_grade_id = ANY($1)
		ORDER BY c.student_grade_id, c.id
	)
	SELECT current.student_grade_id AS "studentGradeId",
		current.id AS "capabilityId",
		sc.accountancy_id AS "accountancyId",
		sc.amount::text AS amount
	FROM current
	LEFT JOIN tbr_student_cost_capabilities sc ON sc.student_cap_id = current.id
	ORDER BY current.student_grade_id, sc.id`

// ─── Writes ──────────────────────────────────────────────────────────────────

/**
 * `StudentCapability::create([...])`.
 *
 * **Both** `student_id` and `student_grade_id` are written. Data Master's period lock
 * (`billing/student-cost-sql.ts:169-174`) reaches capabilities through `student_id`, so a row
 * with only `student_grade_id` set is invisible to it and the lock silently stops working.
 *
 * `approve_date` is the caller's — `@massStore`/`@massUpdate` pass `now()` because they create
 * the row already `approve`, while the single-santri path leaves it null on a `disapprove` row.
 */
export const INSERT_CAPABILITY_SQL = `INSERT INTO tbr_student_capabilities
		(student_id, student_grade_id, approve_date, note, status, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, now(), now())
	RETURNING id`

/**
 * `$capability->accountancies()->attach($id, ['amount' => …])`.
 *
 * `withTimestamps()` on the legacy relation is why the pivot carries `created_at`/`updated_at`.
 * Written as one multi-row insert rather than legacy's statement per line item.
 */
export const INSERT_CAPABILITY_ITEMS_SQL = `INSERT INTO tbr_student_cost_capabilities
		(student_cap_id, accountancy_id, amount, created_at, updated_at)
	SELECT $1, u.accountancy_id, u.amount, now(), now()
	FROM unnest($2::bigint[], $3::bigint[]) AS u(accountancy_id, amount)`

/**
 * `$prev_student_capability->update(['status' => 'changed'])` (`massUpdate:412`).
 *
 * Legacy called `->update()` straight off an unguarded `->first()`, so one santri with no
 * approved capability threw `Call to a member function update() on null` and 500'd the whole
 * batch — after the earlier santri had already been written, because there was no transaction.
 * This returns the ids it actually touched so the service can tell the two cases apart instead
 * of dereferencing null.
 */
export const SUPERSEDE_CAPABILITY_SQL = `UPDATE tbr_student_capabilities
	SET status = 'changed', updated_at = now()
	WHERE id = $1
	RETURNING id`

/**
 * `massUpdate:436-446` — the accounts the shared mass-edit form did **not** show, replicated
 * forward onto the new capability.
 *
 * Legacy did this with Eloquent's `replicate(['student_cap_id'])` per row, driven by
 * `whereNotIn('accountancy_id', $request->showed_id)` with `showed_id` taken off the request
 * unvalidated. Dropping this step silently deletes every account a santri holds privately —
 * anything the intersection hid.
 *
 * `$2` is the shown list; an empty array replicates everything, which is the correct reading of
 * "the form showed nothing".
 */
export const REPLICATE_HIDDEN_ITEMS_SQL = `INSERT INTO tbr_student_cost_capabilities
		(student_cap_id, accountancy_id, amount, created_at, updated_at)
	SELECT $1, sc.accountancy_id, sc.amount, now(), now()
	FROM tbr_student_cost_capabilities sc
	WHERE sc.student_cap_id = $2 AND NOT (sc.accountancy_id = ANY($3))
	ORDER BY sc.id`

/**
 * Locks the santri's capability rows before the batch writes any of them, in id order, so two
 * operators publishing overlapping selections serialise instead of interleaving. Legacy had no
 * transaction and no lock anywhere in this controller.
 */
export const LOCK_CAPABILITIES_SQL = `SELECT c.id
	FROM tbr_student_capabilities c
	WHERE c.student_grade_id = ANY($1)
	ORDER BY c.id
	FOR UPDATE`
