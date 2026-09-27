// Raw SQL for the Kesanggupan write half — legacy `StudentCapabilityController@store` (567-628),
// `@change` (631-679), `@update` (839-880) and `@publishInvoice` (681-836).
//
// Three data facts shape almost every statement here:
//
//   * **`tbr_accountancies` has no `deleted_at`.** Ids 3, 15, 16, 17 and 20 were hard-deleted and
//     725 invoices, plus their capability line items, still point at them. Every join to that
//     table is a LEFT JOIN; the billable predicate then drops the dangling rows on its own, which
//     is what legacy's inner join did, without the join silently eating rows anywhere else.
//   * **`is_student_cost` is `boolean` and `parent_id` is `varchar`.** `is_student_cost = 1` raises
//     `operator does not exist: boolean = integer`, and `parent_id` holds the string `'1'`.
//   * **`student_cost_terms.grade` is `varchar`, `student_grades.grade` is `bigint`.** Every
//     comparison between them is cast explicitly; one live `student_grades.grade` is `34`.
//
// Money and the schedule columns are `bigint`, which node-postgres returns as strings; nothing here
// does arithmetic on them — the service normalises through `toAmount()`.

import type { EntityManager } from "typeorm"

import type { CapabilityItemSqlRow, StudentGradeSqlRow } from "@admin/capabilities/capability-write"
import { Accountancy } from "@admin/common/entities/accountancy.entity"
import { StudentCapability } from "@santri/entities/student-capability.entity"
import { StudentCostCapability } from "@santri/entities/student-cost-capability.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"

// `config/app.php` → `'timezone' => 'Asia/Jakarta'`; `Carbon::now()` runs in it
const JAKARTA_NOW = "(now() AT TIME ZONE 'Asia/Jakarta')"

/** A leaf account the santri actually pays: `whereNotNull('parent_id')->where('is_student_cost', 1)`. */
const BILLABLE = "a.parentId IS NOT NULL AND a.isStudentCost IS TRUE"

// ─── Reads ──────────────────────────────────────────────────────────────────────

/** The santri row the whole publish keys on. `StudentGrade` uses `SoftDeletes`. */
export const selectStudentGrade = (
	manager: EntityManager,
	studentGradeId: number,
): Promise<StudentGradeSqlRow | undefined> =>
	manager
		.createQueryBuilder(StudentGrade, "sg")
		.select("sg.id", "id")
		.addSelect("sg.studentId", "studentId")
		.addSelect("sg.grade", "grade")
		.addSelect("sg.currentAcademicYear", "currentAcademicYear")
		.addSelect("sg.fullname", "fullName")
		.where("sg.id = :studentGradeId", { studentGradeId })
		.andWhere("sg.deletedAt IS NULL")
		.getRawOne<StudentGradeSqlRow>()

/**
 * `getAcademicYearId($student_grade->current_academic_year)` — `AcademicYear::where('year', …)`.
 *
 * Legacy dereferences `->first()->id` with no guard, so a santri whose `current_academic_year`
 * names no row 500s. The caller turns a miss into a 422 instead.
 */
export const selectAcademicYearByName = async (
	manager: EntityManager,
	year: string | null,
): Promise<AcademicYear | null> =>
	year === null
		? null
		: manager.findOne(AcademicYear, {
				select: { id: true, year: true, costDateStart: true, costDateEnd: true },
				where: { year },
				order: { id: "ASC" },
			})

/** `StudentCapability::where(['status' => 'approve', 'student_grade_id' => …])->first()`. */
export const selectApprovedCapability = (
	manager: EntityManager,
	studentGradeId: number,
): Promise<StudentCapability | null> =>
	manager.findOne(StudentCapability, {
		select: { id: true, status: true },
		where: { studentGradeId, status: "approve" },
		order: { id: "ASC" },
		lock: { mode: "pessimistic_write" },
	})

/** The capability's agreed lines, narrowed to the billable leaf accounts, in attach order. */
export const selectCapabilityItems = (
	manager: EntityManager,
	capabilityId: number,
): Promise<CapabilityItemSqlRow[]> =>
	manager
		.createQueryBuilder(StudentCostCapability, "scc")
		.select("scc.id", "id")
		.addSelect("scc.accountancyId", "accountancyId")
		.addSelect("scc.amount", "amount")
		.addSelect("a.name", "name")
		.leftJoin(Accountancy, "a", "a.id = scc.accountancyId")
		.where("scc.studentCapId = :capabilityId", { capabilityId })
		.andWhere(BILLABLE)
		.orderBy("scc.id", "ASC")
		.getRawMany<CapabilityItemSqlRow>()

/**
 * Every accountancy an agreement may hold for this (year, grade) — the set legacy's `store()`,
 * `change()` and `update()` iterate when they attach line items.
 *
 * The `EXISTS` is legacy's `whereHas('accountancy', …)`: an applied term whose accountancy was
 * hard-deleted (18 such terms) never matched it. It matters most in `change()`, where legacy reads
 * `$student_cost_term->accountancy->id` off the result and a null there is an uncaught 500 — every
 * grade-1 santri in 2023/2024 hits it, because accountancies 3 and 16 are both gone. The check is
 * existence only, **not** `parent_id`/`is_student_cost`: legacy lets a non-billable account be
 * agreed to and drops it at publish time, which is where the billable filter lives.
 */
export const SELECT_APPLIED_ACCOUNTANCIES_SQL = `SELECT DISTINCT ON (sct.accountancy_id)
		sct.accountancy_id AS "accountancyId"
	FROM tbr_student_cost_terms sct
	WHERE sct.academic_year_id = $1
		AND sct.grade = $2
		AND sct.applied IS TRUE
		AND EXISTS (SELECT 1 FROM tbr_accountancies a WHERE a.id = sct.accountancy_id)
	ORDER BY sct.accountancy_id, sct.id`

// ─── The generation counter ─────────────────────────────────────────────────────

/**
 * The highest generation any invoice of this santri already carries.
 *
 * Legacy's seg4 is the **capability count**, which does not move when the same capability is
 * published twice — and "Telah Disepakati" can be pressed twice. That is exactly what happened to
 * student_grade 1049 on 2022-07-31: capability 434 was published at 04:56 and again at 05:03, both
 * runs stamped generation 3, and the santri ended up with two physical rows for each of 24
 * `unique_id`s, 12 of them already `paid`. student_grade 1282 has the same wound at 18 ids.
 * Taking `GREATEST(count, max + 1)` keeps legacy's number whenever legacy's number was sound —
 * including the gaps left by capabilities that were created and never published, 162 santri — and
 * strictly increases on a re-publish, so a `unique_id` can never be reused.
 */
export const MAX_INVOICE_GENERATION_SQL = `SELECT
		COALESCE(max((split_part(unique_id, '-', 4))::int), 0) AS "maxGeneration"
	FROM tbr_student_invoices
	WHERE student_grade_id = $1 AND unique_id ~ '^[0-9]+-[0-9]+-[0-9]+-[0-9]+$'`

// ─── Writes ─────────────────────────────────────────────────────────────────────

// Both sequences trail their table's MAX(id) after a back-dated import, and an insert that draws
// from a lagging sequence collides on the primary key — the same hazard `payment-write.ts` guards.
const sync = (table: string): string => `SELECT setval('${table}_id_seq',
		GREATEST((SELECT last_value FROM ${table}_id_seq), (SELECT COALESCE(MAX(id), 1) FROM ${table})), true)`

export const SYNC_CAPABILITY_SEQUENCE_SQL = sync("tbr_student_capabilities")
export const SYNC_CAPABILITY_ITEM_SEQUENCE_SQL = sync("tbr_student_cost_capabilities")
export const SYNC_INVOICE_SEQUENCE_SQL = sync("tbr_student_invoices")

/**
 * Step 3 of the publish: the santri's **entire** previous generation stops counting.
 *
 * Kept as legacy, paid invoices included and with no confirmation step — that is the documented
 * behaviour of "Telah Disepakati" and 186 santri have already been through it. One statement
 * instead of a `foreach` of 22 individual updates.
 */
export const INVALIDATE_INVOICES_SQL = `UPDATE tbr_student_invoices
	SET validity_status = false, updated_at = now()
	WHERE student_grade_id = $1 AND validity_status IS DISTINCT FROM false`

/**
 * Every predecessor this publish needs, in one query.
 *
 * `StudentInvoiceService::getPreviousInvoiceUniqueIdSearch` walks `seg4` down one at a time,
 * issuing a query per step per invoice — and when the walk runs out it returns **the id it was
 * given**, so `StudentInvoice::where(['unique_id' => $prev])->first()` hands the freshly inserted
 * row back as its own predecessor. `DISTINCT ON` does the whole walk once, and `id <> ALL($2)`
 * makes returning one of this publish's own rows impossible.
 *
 * `overdue` is computed here so the `Carbon::parse($due_date) < now()` comparison never has to
 * become a JS `Date`: `due_date` is a `date` and any round-trip through one shifts the day.
 */
export const SELECT_PREDECESSORS_SQL = `SELECT DISTINCT ON (
		(split_part(si.unique_id, '-', 2))::bigint, (split_part(si.unique_id, '-', 3))::int)
		si.id,
		si.unique_id AS "uniqueId",
		(split_part(si.unique_id, '-', 2))::bigint AS "accountancyId",
		(split_part(si.unique_id, '-', 3))::int AS "index",
		si.amount,
		si.status,
		si.payment_method AS "paymentMethod",
		(si.due_date::timestamp < ${JAKARTA_NOW}) AS overdue
	FROM tbr_student_invoices si
	WHERE si.student_grade_id = $1
		AND NOT (si.id = ANY($2::bigint[]))
		AND si.unique_id ~ '^[0-9]+-[0-9]+-[0-9]+-[0-9]+$'
		AND (split_part(si.unique_id, '-', 4))::int < $3
	ORDER BY (split_part(si.unique_id, '-', 2))::bigint,
		(split_part(si.unique_id, '-', 3))::int,
		(split_part(si.unique_id, '-', 4))::int DESC,
		si.id DESC`
