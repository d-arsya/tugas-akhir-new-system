// Raw SQL for the two agreement documents — legacy `StudentCapabilityController@print` and
// `@downloadPDF`. Split out of `capability-sql.ts` to keep both under the 300-line limit; the
// one statement they share with the drill-down (`CAPABILITY_SQL`, the pair guard) stays there.

import type { EntityManager } from "typeorm"

import type { CapabilityDocumentSchool, CapabilityDocumentStudent } from "@admin/capabilities/capability-document"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { District } from "@shared/location/entities/district.entity"
import { Province } from "@shared/location/entities/province.entity"
import { Regency } from "@shared/location/entities/regency.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

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
export const selectDocumentStudent = (
	manager: EntityManager,
	studentGradeId: number,
): Promise<CapabilityDocumentStudent | undefined> =>
	manager
		.createQueryBuilder(StudentGrade, "sg")
		.select("sg.id", "studentGradeId")
		.addSelect("sg.fullname", "fullname")
		.addSelect("sg.schoolName", "schoolName")
		.addSelect("sg.currentAcademicYear", "currentAcademicYear")
		.addSelect("sg.grade", "grade")
		.addSelect("sg.fatherFullname", "fatherFullname")
		.addSelect("sg.fatherJob", "fatherJob")
		.addSelect("sg.fatherPhone", "fatherPhone")
		.addSelect("sg.familyStreet", "familyStreet")
		.addSelect("sg.familyRt", "familyRt")
		.addSelect("sg.familyRw", "familyRw")
		.addSelect("sg.familySubVillage", "familySubVillage")
		.addSelect("sg.familyVillage", "familyVillage")
		.addSelect("d.name", "districtName")
		.addSelect("r.name", "regencyName")
		.addSelect("p.name", "provinceName")
		.addSelect("ay.id", "academicYearId")
		.leftJoin(District, "d", "d.id = sg.familyDistrictId")
		.leftJoin(Regency, "r", "r.id = sg.familyRegencyId")
		.leftJoin(Province, "p", "p.id = sg.familyProvinceId")
		.leftJoin(AcademicYear, "ay", "ay.year = sg.currentAcademicYear")
		.where("sg.id = :studentGradeId", { studentGradeId })
		.andWhere("sg.deletedAt IS NULL")
		.getRawOne<CapabilityDocumentStudent>()

/**
 * `SettingSchool::first()` plus the three lookups behind `school_full_address`
 * (`SettingSchool.php:20-31`). Unlike the receipt's `school_invoice_address`, this accessor keeps
 * the "Kecamatan" and "Provinsi" prefixes, so they are added in the formatter rather than here.
 */
export const selectDocumentSchool = (manager: EntityManager): Promise<CapabilityDocumentSchool | undefined> =>
	manager
		.createQueryBuilder(SettingSchool, "ss")
		.select("ss.name", "name")
		.addSelect("ss.phone", "phone")
		.addSelect("ss.logo", "logo")
		.addSelect("ss.fullAddress", "fullAddress")
		.addSelect("d.name", "districtName")
		.addSelect("r.name", "regencyName")
		.addSelect("p.name", "provinceName")
		.leftJoin(District, "d", "d.id = ss.districtId")
		.leftJoin(Regency, "r", "r.id = ss.regencyId")
		.leftJoin(Province, "p", "p.id = ss.provinceId")
		.orderBy("ss.id", "ASC")
		.limit(1)
		.getRawOne<CapabilityDocumentSchool>()
