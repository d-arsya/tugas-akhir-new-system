import { UnprocessableEntityException } from "@nestjs/common"
import type { EntityManager } from "typeorm"

import { syncStudentWalletActive } from "../../../shared/ewallet/student-wallet"
import { deleteDiseaseHistories } from "../../../shared/society/disease-history"

import { TIMEZONE } from "@admin/common/sql"

// Row-level operations the Santri writes share, each a port of a legacy model method or controller
// helper. All take the request transaction's manager (approved fix: one transaction per request).

// `lang/id/admin.php`
export const UPDATE_SUCCESS = "Data berhasil diupdate."
export const UPDATE_FAILED = "Data gagal diupdate."
export const DELETE_SUCCESS = "Data berhasil dihapus dari basis data."
export const DELETE_FAILED = "Data gagal dihapus dari basis data."
// `nextGrades:629` / `stayGrades:701`
export const NO_NEXT_YEAR = "Belum ada tahun ajaran diatasnya.<br> Silakan buat tahun ajaran baru di<br> master tahun ajaran"
export const ALL_FAILED = "Semua aksi gagal"

/** Legacy answers every failure with a message and a non-2xx status; the port uses 422 for all of them. */
export const fail = (message: string): never => {
	throw new UnprocessableEntityException(message)
}

export type GradeRow = {
	id: string
	student_id: string | null
	grade: string | null
	level_id: string | null
	grade_status: string | null
	grade_note: string | null
	prev_grade_note: string | null
	current_academic_year: string | null
	fullname: string | null
}

const GRADE_ROW_COLUMNS = `id, student_id, grade, level_id, grade_status, grade_note, prev_grade_note, current_academic_year, fullname`

/** `StudentGrade::find($id)` — a live row, or null (legacy then dies on `null->…` → the action's failure message). */
export const findGradeRow = async (manager: EntityManager, id: number): Promise<GradeRow | null> => {
	const rows = (await manager.query(
		`SELECT ${GRADE_ROW_COLUMNS} FROM tbr_student_grades WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
		[id],
	)) as GradeRow[]
	return rows[0] ?? null
}

/**
 * `StudentService::nextAcademicYear()` — `($a + 1) . "/" . ($b + 1)`. A year without two numeric halves
 * ("Archive") makes PHP throw inside the try, which answers the action's generic failure.
 */
export const nextAcademicYear = (year: string | null, failure: string): string => {
	const parts = (year ?? "").split("/")
	if (parts.length < 2 || !/^\s*\d+/.test(parts[0] ?? "") || !/^\s*\d+/.test(parts[1] ?? "")) return fail(failure)
	return `${parseInt(parts[0] ?? "", 10) + 1}/${parseInt(parts[1] ?? "", 10) + 1}`
}

/** `AcademicYearService::getPreviousAcademicYear()` — `intval($a) - 1 . "/" . intval($b) - 1`. */
export const previousAcademicYear = (year: string | null): string => {
	const [first, second] = (year ?? "").split("/")
	const intval = (value: string | undefined): number => {
		const match = /^\s*[+-]?\d+/.exec(value ?? "")
		return match ? parseInt(match[0], 10) : 0
	}
	return `${intval(first) - 1}/${intval(second) - 1}`
}

/** `StudentService::hasNextAcademicYear()` */
export const hasNextAcademicYear = async (manager: EntityManager, year: string | null, failure: string): Promise<boolean> => {
	const next = nextAcademicYear(year, failure)
	const rows = (await manager.query(`SELECT 1 FROM tbr_academic_years WHERE year = $1 LIMIT 1`, [next])) as unknown[]
	return rows.length > 0
}

let replicaColumns: string[] | null = null

/** Every `tbr_student_grades` column but `id`, `created_at`, `updated_at` — what `Model::replicate()` copies. */
const replicateColumnList = async (manager: EntityManager): Promise<string[]> => {
	if (replicaColumns) return replicaColumns
	const rows = (await manager.query(
		`SELECT column_name FROM information_schema.columns
		WHERE table_schema = current_schema() AND table_name = 'tbr_student_grades'
			AND column_name NOT IN ('id', 'created_at', 'updated_at')
		ORDER BY ordinal_position`,
	)) as Array<{ column_name: string }>
	replicaColumns = rows.map((row) => `"${row.column_name}"`)
	return replicaColumns
}

/** `$student->replicate()->save()` — a copy of the row with fresh timestamps; returns the new id. */
export const replicateGradeRow = async (manager: EntityManager, id: number): Promise<number> => {
	const columns = (await replicateColumnList(manager)).join(", ")
	const rows = (await manager.query(
		`INSERT INTO tbr_student_grades (${columns}, created_at, updated_at)
		SELECT ${columns}, now(), now() FROM tbr_student_grades WHERE id = $1
		RETURNING id`,
		[id],
	)) as Array<{ id: string }>
	return Number(rows[0]?.id)
}

/** `$student_grade->student->update([...])` + the wallet observer. A missing account is a no-op, as `withDefault()`. */
export const updateStudentAccount = async (
	manager: EntityManager,
	studentId: string | number | null,
	set: { is_blocked?: boolean | null; student_status?: string },
): Promise<void> => {
	if (studentId === null) return
	const assignments: string[] = []
	const params: unknown[] = [Number(studentId)]
	for (const [column, value] of Object.entries(set)) {
		params.push(value)
		assignments.push(`${column} = $${params.length}`)
	}
	if (assignments.length === 0) return
	await manager.query(
		`UPDATE tbr_students SET ${assignments.join(", ")}, updated_at = now() WHERE id = $1 AND deleted_at IS NULL`,
		params,
	)
	await syncStudentWalletActive(manager, Number(studentId))
}

/**
 * `StudentController::deleteUnpaidInvoice()` — `status = 'unpaid'` and `whereDate('due_date', '>', now())`,
 * hard-deleted (`StudentInvoice` has no soft delete). Called with the **grade row id** (approved fix: legacy
 * passed the student id at `dropout:819` and `deleteStudentByGrade:1074`).
 */
export const deleteUnpaidInvoices = async (manager: EntityManager, studentGradeId: number): Promise<void> => {
	await manager.query(
		`DELETE FROM tbr_student_invoices
		WHERE student_grade_id = $1 AND status = 'unpaid' AND due_date > (now() AT TIME ZONE '${TIMEZONE}')::date`,
		[studentGradeId],
	)
}

/** `StudentController::deleteCapability()` — plain hard delete of the grade row's capabilities. */
export const deleteCapabilities = async (manager: EntityManager, studentGradeId: number): Promise<void> => {
	await manager.query(`DELETE FROM tbr_student_capabilities WHERE student_grade_id = $1`, [studentGradeId])
}

/**
 * `StudentGrade::delete()` (`Models/StudentGrade.php:89-100`): drop the row's disease histories, soft-delete
 * the row, and soft-delete the account once it has no live grade row left (`$this->student()->delete()` is a
 * builder update: `deleted_at` + `updated_at`, no observer — the wallet sync after it changes nothing
 * unless the wallet had already drifted).
 */
export const deleteGradeRow = async (manager: EntityManager, studentGradeId: number): Promise<void> => {
	// TypeORM answers an UPDATE with `[rows, rowCount]`, so the owner is read first instead of `RETURNING`
	const rows = (await manager.query(`SELECT student_id FROM tbr_student_grades WHERE id = $1 AND deleted_at IS NULL`, [studentGradeId])) as Array<{
		student_id: string | null
	}>
	if (rows.length === 0) return
	await manager.query(`UPDATE tbr_student_grades SET deleted_at = now(), updated_at = now() WHERE id = $1`, [studentGradeId])
	await deleteDiseaseHistories(manager, "student", studentGradeId)
	const studentId = rows[0]?.student_id ?? null
	if (studentId === null) return

	const left = (await manager.query(
		`SELECT 1 FROM tbr_student_grades WHERE student_id = $1 AND deleted_at IS NULL LIMIT 1`,
		[studentId],
	)) as unknown[]
	if (left.length > 0) return

	await manager.query(
		`UPDATE tbr_students SET deleted_at = now(), updated_at = now() WHERE id = $1 AND deleted_at IS NULL`,
		[studentId],
	)
	await syncStudentWalletActive(manager, Number(studentId))
}
