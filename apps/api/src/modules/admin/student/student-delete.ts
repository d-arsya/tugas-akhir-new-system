import type { EntityManager } from "typeorm"

import { StudentGrade } from "@santri/entities/student-grade.entity"
import { Grade } from "@shared/master/entities/grade.entity"
import {
	DELETE_FAILED,
	DELETE_SUCCESS,
	deleteCapabilities,
	deleteGradeRow,
	deleteUnpaidInvoices,
	fail,
	previousAcademicYear,
	updateStudentAccount,
} from "./student-grade-ops"

// Santri deletes — `StudentController::destroy:947-971` (one grade row, from the roster) and
// `deleteStudentByGrade:1054-1093` (every active row of a grade in a year, from the grades page), both
// reopening the previous class row through `updateKbmNote:976-1029`. Each runs in one transaction.

type KbmRow = {
	id: string
	student_id: string | null
	grade_status: string | null
	grade_note: StudentGrade["gradeNote"]
	prev_grade_note: StudentGrade["prevGradeNote"]
	current_academic_year: string | null
}

/**
 * `StudentGrade::whereHas('student', fn => where('nis', $nis))` — a live account with that NIS (a null NIS
 * becomes `whereNull`, as Laravel's two-argument `where` does). `->first()` has no order; `id` stands in.
 */
const byNis = `EXISTS (SELECT 1 FROM tbr_students s WHERE s.id = sg.student_id AND s.deleted_at IS NULL AND s.nis IS NOT DISTINCT FROM $1)`
const KBM_COLUMNS = `sg.id, sg.student_id, sg.grade_status, sg.grade_note, sg.prev_grade_note, sg.current_academic_year`

const firstRow = async (manager: EntityManager, where: string, params: unknown[]): Promise<KbmRow | null> => {
	const rows = (await manager.query(
		`SELECT ${KBM_COLUMNS} FROM tbr_student_grades sg WHERE sg.deleted_at IS NULL AND ${byNis} AND ${where} ORDER BY sg.id LIMIT 1`,
		params,
	)) as KbmRow[]
	return rows[0] ?? null
}

const reopen = async (manager: EntityManager, row: KbmRow): Promise<void> => {
	await manager.update(StudentGrade, { id: Number(row.id) }, { gradeStatus: "active", gradeNote: row.prev_grade_note })
}

/**
 * `updateKbmNote($nis, $grade)`: reopen the santri's row one grade below (unless the deleted row is a
 * Tinggal Kelas copy, which reopens last year's row of the same grade instead); a Keluar row being deleted
 * also unblocks the account of the reopened row. Legacy dies on a missing "current" or "previous year" row,
 * which aborts the delete with its failure message — the transaction does the same.
 */
export const updateKbmNote = async (manager: EntityManager, nis: string | null, grade: string | null): Promise<void> => {
	// `Grade::orderBy('label', 'desc')`: the first label below `$grade`, else `$grade` itself
	const grades = await manager.find(Grade, { select: { label: true }, order: { label: "DESC" } })
	let prevGrade = grade
	for (const { label } of grades) {
		if (label !== null && prevGrade !== null && Number(label) < Number(prevGrade)) {
			prevGrade = String(label)
			break
		}
	}

	const current = await firstRow(manager, `sg.grade_status = 'active' AND sg.grade IS NOT DISTINCT FROM $2::bigint`, [nis, grade])
	const lower = await firstRow(manager, `sg.grade IS NOT DISTINCT FROM $2::bigint`, [nis, prevGrade])
	if (!current) return fail(DELETE_FAILED)

	if (lower && current.grade_note !== "tinggal kelas") {
		await reopen(manager, lower)
		if (current.grade_note === "keluar") await updateStudentAccount(manager, lower.student_id, { is_blocked: false })
	}

	if (current.grade_note === "tinggal kelas") {
		const previousYear = await firstRow(manager, `sg.grade_status = 'inactive' AND sg.current_academic_year = $2`, [
			nis,
			previousAcademicYear(current.current_academic_year),
		])
		if (!previousYear) return fail(DELETE_FAILED)
		await reopen(manager, previousYear)
	}
}

/** `destroy:947-971` — only an active row; then the grade row cascade, its unpaid future invoices and its capabilities. */
export const destroyGradeRow = async (manager: EntityManager, studentGradeId: number): Promise<string> => {
	const rows = (await manager.query(
		`SELECT sg.id, sg.grade, sg.grade_status, s.nis FROM tbr_student_grades sg
		LEFT JOIN tbr_students s ON s.id = sg.student_id AND s.deleted_at IS NULL
		WHERE sg.id = $1 AND sg.deleted_at IS NULL FOR UPDATE OF sg`,
		[studentGradeId],
	)) as Array<{ id: string; grade: string | null; grade_status: string | null; nis: string | null }>
	const row = rows[0]
	if (!row || row.grade_status === "inactive") return fail(DELETE_FAILED)

	await updateKbmNote(manager, row.nis, row.grade)
	await deleteGradeRow(manager, studentGradeId)
	await deleteUnpaidInvoices(manager, studentGradeId)
	await deleteCapabilities(manager, studentGradeId)
	return DELETE_SUCCESS
}

/**
 * `deleteStudentByGrade:1054-1093` — every **active** row of the grade in the year, whatever its level (kept
 * quirk). The reopening runs row by row first; the rows are then re-read (`$student_grades->pluck('id')`
 * re-executes the query) and deleted. No active row at all → the "all failed" branch → failure message.
 * Capabilities are not touched here, as in legacy.
 */
export const destroyByGrade = async (manager: EntityManager, year: string | null, grade: number): Promise<string> => {
	const select = `SELECT sg.id, sg.grade, s.nis FROM tbr_student_grades sg
		LEFT JOIN tbr_students s ON s.id = sg.student_id AND s.deleted_at IS NULL
		WHERE sg.deleted_at IS NULL AND sg.current_academic_year = $1 AND sg.grade = $2 AND sg.grade_status = 'active'
		ORDER BY sg.id`
	const rows = (await manager.query(select, [year, grade])) as Array<{ id: string; grade: string | null; nis: string | null }>

	for (const row of rows) {
		await updateKbmNote(manager, row.nis, row.grade)
		// Approved fix: the grade row id (legacy passed `$student_grade->student->id`)
		await deleteUnpaidInvoices(manager, Number(row.id))
	}

	const after = (await manager.query(select, [year, grade])) as Array<{ id: string }>
	if (after.length === 0) return fail(DELETE_FAILED)
	for (const row of after) await deleteGradeRow(manager, Number(row.id))
	return DELETE_SUCCESS
}
