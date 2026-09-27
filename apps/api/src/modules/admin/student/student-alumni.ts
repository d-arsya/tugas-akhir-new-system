import type { EntityManager } from "typeorm"

import { copyDiseaseHistories } from "../../../shared/society/disease-history"

import { fail, UPDATE_FAILED } from "./student-grade-ops"
import { Alumni } from "@admin/common/entities/alumni.entity"
import { TIMEZONE } from "@admin/common/sql"
import { StudentGrade } from "@santri/entities/student-grade.entity"

// `StudentController::createAlumni:763-792`, called by Lulus for every graduated grade row.

let sharedColumns: string[] | null = null

/**
 * `array_intersect_key($student_grade->toArray(), Schema::getColumnListing('alumnis') - [id, student_id])` —
 * every column the two tables share. Read once from the catalogue, like legacy's `Schema` call.
 */
const alumniSharedColumns = async (manager: EntityManager): Promise<string[]> => {
	if (sharedColumns) return sharedColumns
	const rows = (await manager.query(
		`SELECT a.column_name FROM information_schema.columns a
		JOIN information_schema.columns g ON g.table_schema = a.table_schema AND g.table_name = 'tbr_student_grades'
			AND g.column_name = a.column_name
		WHERE a.table_schema = current_schema() AND a.table_name = 'tbr_alumnis'
			AND a.column_name NOT IN ('id', 'student_id', 'nis', 'academic_year_id', 'alumni_email', 'graduate_at', 'graduate_year')
		ORDER BY a.ordinal_position`,
	)) as Array<{ column_name: string }>
	sharedColumns = rows.map((row) => row.column_name)
	return sharedColumns
}

/**
 * `toArray()` serialises `created_at` / `updated_at` as UTC ISO strings and `Alumni::create()` stores that
 * wall clock back in the app timezone, so both land seven hours early (117/117 existing alumni rows show
 * it). Kept: `(T AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta'` is exactly that shift.
 */
const selectExpression = (column: string): string =>
	column === "created_at" || column === "updated_at"
		? `(sg."${column}" AT TIME ZONE 'UTC') AT TIME ZONE '${TIMEZONE}'`
		: `sg."${column}"`

/**
 * Creates the alumni row of a graduated grade row, unless one already exists for it (`tbr_alumnis.student_id`
 * holds the **grade row** id), then copies its disease histories onto it. `graduate_year` is `now()` with the
 * year set to the second half of `current_academic_year` (`now()->setYear(explode('/', …)[1])`).
 */
export const createAlumni = async (manager: EntityManager, studentGradeId: number): Promise<void> => {
	if (await manager.existsBy(Alumni, { studentId: studentGradeId })) return

	const gradeRow = await manager.findOne(StudentGrade, { select: { id: true, currentAcademicYear: true }, where: { id: studentGradeId } })
	const graduateYear = /^\s*(\d+)/.exec((gradeRow?.currentAcademicYear ?? "").split("/")[1] ?? "")?.[1]
	if (graduateYear === undefined) fail(UPDATE_FAILED)

	const columns = await alumniSharedColumns(manager)
	const rows = (await manager.query(
		`INSERT INTO tbr_alumnis (${columns.map((column) => `"${column}"`).join(", ")},
			student_id, nis, academic_year_id, alumni_email, graduate_at, graduate_year)
		SELECT ${columns.map(selectExpression).join(", ")},
			sg.id, s.nis::bigint, s.academic_year_id, s.email, now(),
			((now() AT TIME ZONE '${TIMEZONE}') + make_interval(years => $2::int - extract(year FROM now() AT TIME ZONE '${TIMEZONE}')::int)) AT TIME ZONE '${TIMEZONE}'
		FROM tbr_student_grades sg
		LEFT JOIN tbr_students s ON s.id = sg.student_id AND s.deleted_at IS NULL
		WHERE sg.id = $1
		RETURNING id`,
		[studentGradeId, Number(graduateYear)],
	)) as Array<{ id: string }>

	await copyDiseaseHistories(manager, { society: "student", id: studentGradeId }, { society: "alumni", id: Number(rows[0]?.id) })
}
