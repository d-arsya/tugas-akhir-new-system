// Raw SQL for the two agreement documents — legacy `StudentCapabilityController@print` and
// `@downloadPDF`. Split out of `capability-sql.ts` to keep both under the 300-line limit; the
// one statement they share with the drill-down (`CAPABILITY_SQL`, the pair guard) stays there.

/**
 * `$capability->accountancies()->whereNotNull('parent_id')->where('is_student_cost', 1)->get()`
 * with the pivot amount, plus the term whose `translate_period` fills the Periode column.
 *
 * The join to `tbr_accountancies` is written LEFT but the `WHERE` filters on two of its columns,
 * so a line item pointing at a hard-deleted accountancy is dropped here exactly as legacy's
 * `belongsToMany` inner join drops it — from the table **and** from the total. That is kept, not
 * fixed: `parent_id IS NOT NULL AND is_student_cost` is the definition of a billable line, and a
 * row whose account no longer exists cannot be shown to satisfy it. No live capability is in that
 * state today. The service reports the count so a caller can tell a short document from a whole one.
 *
 * One deliberate departure from legacy:
 *
 *  * The period lookup is scoped to the santri's own grade. `Accountancy::getStudentCostTerm()`
 *     filters by `academic_year_id` **only** and takes whatever row comes back first, so for the
 *     three `(year, accountancy)` pairs whose terms disagree across grades (8/10, 18/2, 18/11) it
 *     can print another grade's period. Adding `applied` as well would have been the other half of
 *     the brief's fix, but 75 live line items sit on a grade-1 term that is not applied, and they
 *     have a real period; requiring `applied` would blank them. Scoping to the grade fixes the
 *     leak without losing them, and a lookup that finds nothing renders an empty cell rather than
 *     legacy's literal string `0`. Measured: 0 live line items miss `(year, accountancy, grade)`.
 *
 * `ORDER BY scc.id` is the insertion order the unordered `->get()` happened to produce.
 */
export const CAPABILITY_DOCUMENT_ITEMS_SQL = `SELECT scc.id,
		scc.accountancy_id AS "accountancyId",
		a.name,
		scc.amount,
		term.period
	FROM tbr_student_cost_capabilities scc
	LEFT JOIN tbr_accountancies a ON a.id = scc.accountancy_id
	LEFT JOIN LATERAL (
		SELECT t.period
		  FROM tbr_student_cost_terms t
		 WHERE t.accountancy_id = scc.accountancy_id
		   AND t.academic_year_id = $2
		   AND t.grade = $3
		 ORDER BY t.id
		 LIMIT 1
	) term ON true
	WHERE scc.student_cap_id = $1
	  AND a.parent_id IS NOT NULL
	  AND a.is_student_cost
	ORDER BY scc.id`

/** Every santri field the two agreement views print, plus the three region lookups. */
export const CAPABILITY_DOCUMENT_STUDENT_SQL = `SELECT sg.id AS "studentGradeId",
		sg.fullname,
		sg.school_name AS "schoolName",
		sg.current_academic_year AS "currentAcademicYear",
		sg.grade::text AS grade,
		sg.father_fullname AS "fatherFullname",
		sg.father_job AS "fatherJob",
		sg.father_phone::text AS "fatherPhone",
		sg.family_street AS "familyStreet",
		sg.family_rt AS "familyRt",
		sg.family_rw AS "familyRw",
		sg.family_sub_village AS "familySubVillage",
		sg.family_village AS "familyVillage",
		d.name AS "districtName",
		r.name AS "regencyName",
		p.name AS "provinceName",
		ay.id AS "academicYearId"
	FROM tbr_student_grades sg
	LEFT JOIN tbr_districts d ON d.id = sg.family_district_id
	LEFT JOIN tbr_regencies r ON r.id = sg.family_regency_id
	LEFT JOIN tbr_provinces p ON p.id = sg.family_province_id
	LEFT JOIN tbr_academic_years ay ON ay.year = sg.current_academic_year
	WHERE sg.id = $1 AND sg.deleted_at IS NULL`

/**
 * `SettingSchool::first()` plus the three lookups behind `school_full_address`
 * (`SettingSchool.php:20-31`). Unlike the receipt's `school_invoice_address`, this accessor keeps
 * the "Kecamatan" and "Provinsi" prefixes, so they are added in the formatter rather than here.
 */
export const CAPABILITY_DOCUMENT_SCHOOL_SQL = `SELECT ss.name,
		ss.phone::text AS phone,
		ss.logo,
		ss.full_address AS "fullAddress",
		d.name AS "districtName",
		r.name AS "regencyName",
		p.name AS "provinceName"
	FROM tbr_setting_schools ss
	LEFT JOIN tbr_districts d ON d.id = ss.district_id
	LEFT JOIN tbr_regencies r ON r.id = ss.regency_id
	LEFT JOIN tbr_provinces p ON p.id = ss.province_id
	ORDER BY ss.id
	LIMIT 1`
